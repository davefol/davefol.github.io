#!/usr/bin/env python3

import imaplib
import email
from email.header import decode_header
import os
import sys
from bs4 import BeautifulSoup
import datetime
import re
from collections import OrderedDict
import json
from pathlib import Path
import errno
from typing import Tuple


def as_re_option(x):
    return "|".join([f"[{s[0].upper()}{s[0].lower()}]{s[1:]}" for s in x])


PROJECT_TYPE_RE = as_re_option(
    ["series", "show", "playlist", "course", "class", "book", "project"]
)


PROGRESS_TYPES_RE = as_re_option(
    ["read", "watched", "finished", "completed", "listened to",]
)

# ET => Entry type
BOUNDED_PROJECT_ET = "bounded projects"
OPEN_ENDED_PROJECT_ET = "open ended projects"
BOUNDED_PROGRESS_ET = "bounded progress"
OPEN_ENDED_PROGRESS_ET = "open ended progress"
NOTE_ET = "note"

# 1 => name
# 2 => parts
# 3 => unit
# Ex: I started course stanford data sci with 15 sections.
NEW_BOUNDED_PROJECT_RE = re.compile(
    fr"^(?:I )?(?:[Nn]ew|[Ss]tarted|[Bb]egan) (?:{PROJECT_TYPE_RE}) (.+) with (\d+) (\w+)"
)

# 1 => name
# 2 => parts
# Ex: I read moby dick to page 100.
BOUNDED_PROGRESS_RE = re.compile(
    fr"^(?:I )?(?:{PROGRESS_TYPES_RE}) (.+) (?:to|until) \w+ (\d+)"
)

# 1 => parts
# 2 > name
# Ex: I did 3 hours of meditation.
OPEN_ENDED_PROGRESS_RE = re.compile(
    r"^(?:I )?(?:[Dd]id|[Cc]omplet(?:ed)?|[Ff]inish(?:ed)?) (\d+) \w+ of (\w+)"
)


class Diary:
    class error(Exception):
        pass

    def __init__(self):
        if (diary_path := os.environ.get("DIARY_FILE")) is None:
            raise self.error("Please set the 'DIARY_FILE' environment variable")

        if not os.path.exists(os.path.dirname(diary_path)):
            try:
                os.makedirs(os.path.dirname(diary_path))
            except OSError as exc:  # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise

        if Path(diary_path).exists():
            with open(diary_path) as f:
                self.__storage = json.load(f)
        else:
            self.__storage = {
                BOUNDED_PROJECT_ET: dict(),
                OPEN_ENDED_PROJECT_ET: dict(),
                NOTE_ET: list(),
            }

        self.__diary_path = diary_path

    def add(self, entry: str, dt: datetime.datetime):
        """
        Adds an entry to the diary

        entry: str
        dt: Datetime
        """
        self.__insert(*self.__parse_diary_entry(entry, dt))

    def as_json(self) -> str:
        return json.dumps(self.__storage)

    def flush(self) -> None:
        with open(self.__diary_path, "w") as f:
            json.dump(self.__storage, f, indent=4, sort_keys=True, default=str)

    @staticmethod
    def __parse_diary_entry(s: str, dt: datetime.datetime) -> Tuple[str, dict]:
        """
        s: string representing diary entry
        dt: datetime representing time of entry
        returns a tuple (string, dict) where [0] is the type of entry and [1] is the entry
        """
        if expr := NEW_BOUNDED_PROJECT_RE.match(s):
            return (
                BOUNDED_PROJECT_ET,
                {"name": expr[1], "parts": int(expr[2]), "unit": expr[3], "date": dt},
            )
        elif expr := BOUNDED_PROGRESS_RE.match(s):
            return (
                BOUNDED_PROGRESS_ET,
                {"name": expr[1], "parts": int(expr[2]), "date": dt},
            )
        elif expr := OPEN_ENDED_PROGRESS_RE.match(s):
            return (
                OPEN_ENDED_PROGRESS_ET,
                {"name": expr[2], "parts": int(expr[1]), "date": dt},
            )
        else:
            return (NOTE_ET, {"text": s, "date": dt})

    def __insert(self, entry_type, entry):
        if entry_type == BOUNDED_PROJECT_ET:
            self.__storage[BOUNDED_PROJECT_ET][entry["name"].lower().strip()] = {
                "parts": entry["parts"],
                "unit": entry["unit"],
                "progress": list(),
                "date": entry["date"],
            }
        elif entry_type == BOUNDED_PROGRESS_ET:
            try:
                self.__storage[BOUNDED_PROJECT_ET][entry["name"].lower().strip()][
                    "progress"
                ].append({"parts": entry["parts"], "date": entry["date"]})
            except KeyError as e:
                print(
                    f"Attempted to add BOUNDED_PROGRESS to unknown BOUNDED_PROJECT: {entry['name']}"
                )
        elif entry_type == OPEN_ENDED_PROGRESS_ET:
            if (
                self.__storage[OPEN_ENDED_PROJECT_ET][entry["name"].lower().strip()]
                is None
            ):
                self.__storage[OPEN_ENDED_PROJECT_ET][entry["name"].lower().strip()] = {
                    "progress": list(),
                    "date": entry["date"],
                }
            self.__storage[OPEN_ENDED_PROJECT_ET][entry["name"].lower().strip()][
                "progress"
            ].append({"parts": entry["parts"], "date": entry["date"]})
        elif entry_type == NOTE_ET:
            self.__storage[NOTE_ET].append(
                dict(text=entry["text"].strip(), date=entry["date"])
            )
        else:
            raise NotImplementedError


class EmailConnection:
    class error(Exception):
        pass

    def __init__(self):
        if (username := os.environ.get("DIARY_USERNAME")) is None:
            raise self.error("Please set the 'DIARY_USERNAME' environment variable")

        if (password := os.environ.get("DIARY_PASSWORD")) is None:
            raise self.error("Please set the 'DIARY_PASSWORD' environment variable")

        if (server := os.environ.get("DIARY_SERVER")) is None:
            raise self.error("Please set the 'DIARY_SERVER' environment variable")

        if (sender := os.environ.get("DIARY_SENDER")) is None:
            raise self.error("Please set the 'DIARY_SENDER' environment variable")

        self.__imap = imaplib.IMAP4_SSL(server)

        try:
            self.__imap.login(username, password)
        except imaplib.IMAP4_SSL.error as e:
            raise self.error(e)

        if (self.__imap.select('"[Gmail]/All Mail"'))[0] != "OK":
            self.__imap.close()
            self.__imap.logout()
            raise self.error("Unable to read INBOX")

        self.sender = sender

    def messages(self):
        return self.__imap.search(None, f'UNSEEN FROM "{self.sender}"')

    @property
    def imap(self):
        return self.__imap


class EmailDiaryClient:
    def __init__(self, email_connection):
        self.email_connection = email_connection

    def entry_strings(self):
        for message_id in self.email_connection.messages()[1]:
            print(message_id)
            if message_id:
                for message_id in message_id.split():
                    _, data = self.email_connection.imap.fetch(message_id, "(RFC822)")
                    message = email.message_from_bytes(data[0][1])
                    for part in message.walk():
                        if (payload := part.get_payload(decode=True)) is not None:
                            soup = BeautifulSoup(payload.decode(), "html.parser")
                            if (body := soup.body) is not None:
                                entry_text = body.text.strip()
                                if date_tuple := email.utils.parsedate_tz(
                                    message["Date"]
                                ):
                                    local_date = datetime.datetime.fromtimestamp(
                                        email.utils.mktime_tz(date_tuple)
                                    )
                                else:
                                    local_date = datetime.datetime.now()
                                yield entry_text, local_date


if __name__ == "__main__":
    DIARY = Diary()
    CONNECTION = EmailConnection()
    EMAIL_DIARY_CLIENT = EmailDiaryClient(CONNECTION)
    for (entry_str, dt) in EMAIL_DIARY_CLIENT.entry_strings():
        print(entry_str)
        DIARY.add(entry_str, dt)
    CONNECTION.imap.close()
    CONNECTION.imap.logout()
    DIARY.flush()
