---
layout: post
title: 'Programming My Diary: Processing emails with IMAP'
date: 2020-07-10 15:44 -0400
---

[See part one of this series here.](/2020/07/09/programming-my-diary)

Programming my diary is really two separate projects. The first is
a text to diary entry as json pipeline and the second is an interactive
web visualization of the diary json. In this post I will cover the first project.

```python
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
```

Each time this script is run, the `DIARY` object is 
initialized. Lets see how that works.

```python
def __init__(self):
    if (diary_path := os.environ.get('DIARY_FILE')) is None:
        raise self.error("Please set the 'DIARY_FILE' environment variable")

    if not os.path.exists(os.path.dirname(diary_path)):
        try:
            os.makedirs(os.path.dirname(diary_path))
        except OSError as exc: # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    if Path(diary_path).exists():
        with open(diary_path) as f:
            self.__storage = json.load(f)
    else:
        self.__storage = {BOUNDED_PROJECT_ET: dict(), OPEN_ENDED_PROJECT_ET: dict(), NOTE_ET: list()}

    self.__diary_path = diary_path
```

The path to the json file, in this case `assets/diary.json`,
is retrieved from an environment variable. If that file 
exists, we load the json, if it doesn't then we setup
the state needed for the diary.

The diary needs to keep track of three things. 

1. Bounded Projects: this is anything with a distinct finished condition, such as a course or a book.
2. Unbounded Projects: this is anythign without a finished condition such as meditation.
3. notes: this is everything else such as musing or music recommendations.

After we have an instance of `Diary` we set up our email connection.

```python
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
```

I've ommitted the boiler plate for getting environment variables.
Here we use `imaplib` which is in the Python3 stdlib and gives us
several useful functions that implement [IMAP protocol](https://tools.ietf.org/html/rfc3501).
[You can find the docs here](https://docs.Python.org/3/library/imaplib.html).

Establishing a connection is relatively simple.

1. Login using credentials like mydiary@gmail.com and password123
2. Select the mailbox, in this case its all messages

`sender` is the email address associated with my cell phone. It 
is used to build an IMAP query that filters all messages except for the ones
from my cellhpone that have been unread.

```python
def messages(self):
    return self.__imap.search(None, f'UNSEEN FROM "{self.sender}"')
```

Once we have our email connection, we can pass it on to the
`EmailDiaryClient`. This class is responsible for looping through
all of the messages returned by our connection, ripping out everything 
we dont need like headers and markup and passing it to the `Diary`.

```python
def entry_strings(self):
    for message_id in self.email_connection.messages()[1]:
        print(message_id)
        if message_id:
            for message_id in message_id.split():
                _, data = self.email_connection.imap.fetch(message_id, '(RFC822)')
                message = email.message_from_bytes(data[0][1])
                for part in message.walk():
                    if (payload := part.get_payload(decode=True)) is not None:
                        soup = BeautifulSoup(payload.decode(), 'html.parser')
                        if (body := soup.body) is not None:
                            entry_text = body.text.strip()
                            if date_tuple := email.utils.parsedate_tz(message['Date']):
                                local_date = datetime.datetime.fromtimestamp(email.utils.mktime_tz(date_tuple))
                            else:
                                local_date = datetime.datetime.now()
                            yield entry_text, local_date
```

This bramble of code loops through all of the message ids, 
gets the associated message, converts it into an `email.message` 
using the stdlib [email package](https://docs.Python.org/3/library/email.html).
This allows us to walk through all the parts of the message finding the actual text.
Once we have that we can parse it with the [BeautifulSoup4 package](https://www.crummy.com/software/BeautifulSoup/bs4/doc/).
We could probably get away with some regex or string stripping but every time I
decide to go down that route I regret it since [html is not a regular language](https://blog.codinghorror.com/parsing-html-the-cthulhu-way/).

The `email.message` type also has methods for getting the time the message was sent.
This is useful since, you know, we are making a diary. 

Now that we have the plain text we can pass it off to the `Diary` which has parsing
capabalities. 

```python
@staticmethod
def __parse_diary_entry(s: str, dt: datetime.datetime) -> Tuple[str, dict]:
    """
    s: string representing diary entry
    dt: datetime representing time of entry
    returns a tuple (string, dict) where [0] is the type of entry and [1] is the entry
    """
    if expr := NEW_BOUNDED_PROJECT_RE.match(s):
        return (BOUNDED_PROJECT_ET, { 'name': expr[1], 'parts': int(expr[2]), 'unit': expr[3], 'date': dt })
    elif expr := BOUNDED_PROGRESS_RE.match(s):
        return (BOUNDED_PROGRESS_ET, { 'name': expr[1], 'parts': int(expr[2]), 'date': dt })
    elif expr := OPEN_ENDED_PROGRESS_RE.match(s):
        return (OPEN_ENDED_PROGRESS_ET, { 'name': expr[2], 'parts': int(expr[1]), 'date': dt})
    else:
        return (NOTE_ET, {'text': s, 'date': dt})
```

We are simply matching a few regexes and converting the capture groups into
a `dict`. 

Those `RE` constants are the compiled regular expressions while the `ET` constants
are the diary entry types.

```python
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
NEW_BOUNDED_PROJECT_RE = re.compile(fr"^(?:I )?(?:[Nn]ew|[Ss]tarted|[Bb]egan) (?:{PROJECT_TYPE_RE}) (.+) with (\d+) (\w+)")

# 1 => name
# 2 => parts
# Ex: I read moby dick to page 100.
BOUNDED_PROGRESS_RE = re.compile(fr"^(?:I )?(?:{PROGRESS_TYPES_RE}) (.+) (?:to|until) \w+ (\d+)") 

# 1 => parts
# 2 > name
# Ex: I did 3 hours of meditation.
OPEN_ENDED_PROGRESS_RE = re.compile(r"^(?:I )?(?:[Dd]id|[Cc]omplet(?:ed)?|[Ff]inish(?:ed)?) (\d+) \w+ of (\w+)")
```

All thats left is inserting these `dict`s into the `__storage` of the diary then serializing to a json file. 

```python
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
```

Finally we close the collection and actually perform the write to disk.

```python
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
```

Which is the last three lines of the first code sample. 

All of this code is a classic example of the type of code plumbing I do everyday. 
It feels a little weird to bang out a quick utility script in Python after
the large amount of Rust programming I've been doing lately. I have to say
I miss all of the safety rails Rust provides. I was constantly worried about
whether I handled an exception or confused about exactly what type of object I
was geting from a third party library. Fortunately [mypy](http://mypy-lang.org/)
and [type hinting](https://docs.python.org/3/library/typing.html) helped ease
my anxiety. At the end of the day, Python is a super productive language and a joy to use. 


Note: I know next to nothing about IMAP so if I'm doing something silly here, feel 
free to send and email to correct me. 
