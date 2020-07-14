/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function (dowOffset) {
/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

    dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(),0,1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() - 
    (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if(day < 4) {
        weeknum = Math.floor((daynum+day-1)/7) + 1;
        if(weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1,0,1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
              the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
        }
    }
    else {
        weeknum = Math.floor((daynum+day-1)/7);
    }
    return weeknum - 1;
};

// ----------------------------
// Dave Fol's live diary
//
// This creates a d3 visualization
// from a json file that contains my diary
// ----------------------------

d3.json("/assets/diary.json")
	.then(function(diary) {
		// ----------------------------
		// Initial config
		// This sets up a global `Vis` object
		// so that we do not polute the namespace.
		//
		// We also set the sizing of the elements
		// of the figure as well as the figure itself. 
		// ----------------------------
		var Vis = {};
		Vis.squareWidth = 25;
		Vis.squarePadding = Vis.squareWidth * 0.5;
		Vis.padding = Vis.squareWidth;
		Vis.width = Vis.squareWidth * 7 + Vis.squarePadding * 6  // 7 days in a week
		Vis.timeline = Object.values(diary.timeline);
		Vis.weeks = new Set(Vis.timeline.map(x => x.week));
		Vis.boundedProjects = Object.values(diary["bounded projects"])

		// N weeks with N - 1 padding
		Vis.height = Vis.squareWidth * Vis.weeks.size + Vis.squarePadding * (Vis.weeks.size - 1)

		// ----------------------------
		// Scales 
		// ----------------------------
		Vis.xScale = d3.scaleLinear()
			.domain([
				d3.min(Vis.timeline, x => x.weekday),
				d3.max(Vis.timeline, x => x.weekday)])
			.range([0, Vis.width])

		Vis.yScale = d3.scalePoint()
			.domain(Vis.timeline.map(x => x.week))
			.range([Vis.height, 0])

		Vis.colorScale = d3.scaleLinear()
			.domain([
				d3.min(Vis.timeline, x => x.entries.length),
				d3.max(Vis.timeline, x => x.entries.length)])
			.range([0, 1])

		// ----------------------------
		// Main Figure setup
		// ----------------------------
		Vis.svg = d3.select("body").select("#diary").select("#visualization")
			.append("svg")
			.attr("width", Vis.width + Vis.padding + 2)
			.attr("height", Vis.height + Vis.padding + 4);


		// ----------------------------
		// Placing day squares
		// ----------------------------
		Vis.days = Vis.svg.selectAll("rect")
			.data(Vis.timeline)
			.enter()
			.append("rect");

		Vis.days.attr("x", (day, i) => Vis.xScale(day.weekday)+1)
			.attr("y", (day, i) => Vis.yScale(day.week) + 1)
			.attr("rx", 6)
			.attr("ry", 6)
			.attr("width", (day, i) => Vis.squareWidth)
			.attr("height", (day, i) => Vis.squareWidth)
			.attr("fill", (day, i) => d3.interpolateGreys(Vis.colorScale(day.entries.length)))
			.attr("stroke", (day, i) => "#000000")
			
		// ----------------------------
		// Writing the initial diary text entry
		// This defaults to the latest entry
		// ----------------------------
		Vis.infoEntries = d3.select("#info-entries");
		Vis.infoEntries.selectAll("p")
			.data(Vis.timeline[Vis.timeline.length - 1].entries)
			.enter()
			.append("p")
			.text((entry, i) => `${(new Date(entry.time)).toLocaleTimeString()} - ${entry.text}`)

		// ----------------------------
		// Setting the intitial progress indicators
		// for bounded projects
		// ----------------------------
		function filterBoundedProjects(projects, day) {
			return projects.filter(function(project) {
				let projectDate = new Date(project.date);
				let projectComparison = parseInt(projectDate.getFullYear().toString() + projectDate.getWeek().toString().padStart(2, '0') + projectDate.getDay().toString());
				let dayComparison = parseInt(day.week.toString() + day.weekday.toString());
				return (projectComparison <= dayComparison);
			})
			.map(function(project) {
				let dayComparison = parseInt(day.week.toString() + day.weekday.toString());
				return {
					...project,
					progress: project.progress.filter(function(x) {
						let progressDate = new Date(x.date);
						let progressComparison = parseInt(progressDate.getWeek().toString().padStart(2, '0') + progressDate.getDay().toString());
						return (progressDate >= dayComparison);
					})
				}
			})
		}

		Vis.infoProgress = d3.select("#info-progress")
		Vis.infoProgress.selectAll("div")
			.data(Vis.boundedProjects)
			.enter()
			.append("div")
			.html(function(project, i) {
				let title = document.createElement("div");
				title.innerText = project.name;
				
				let colorScale = d3.scaleOrdinal()
					.domain( [...project.progress.keys()])
					.range(d3.schemePaired);

				let progressBar = document.createElement("div");
				progressBar.classList.add("progress-bar");
				for (let [idx, progress] of project.progress.entries()) {
					let segment = document.createElement("span");
					segment.classList.add("progress-segment");
					if (idx == 0)
						segment.style.width = `${(progress.parts / project.parts) * 100}%`;
					else
						segment.style.width = `${(progress.parts - project.progress[idx - 1].parts) / project.parts * 100}%`;
					segment.style.backgroundColor = colorScale(idx);
					progressBar.appendChild(segment);
				}
				return title.outerHTML + progressBar.outerHTML;
			})
			.attr("class", (project, i) => {
				if (typeof project.status != "undefined")
					return `project-status-${project.status}`
				else
					return ""
			})
			

		// ----------------------------
		// Click handler for each day square
		// This updates the right info panel with 
		// text entries and progress bars
		// ----------------------------
		Vis.days.on("click", function(day, i) {
			Vis.infoEntries.selectAll("p").remove();
			Vis.infoEntries.selectAll("p")
				.data(day.entries)
				.enter()
				.append("p")
				.text((entry, i) => `${(new Date(entry.time)).toLocaleTimeString()} - ${entry.text}`)

			Vis.infoProgress.selectAll("div").remove();
			Vis.infoProgress.selectAll("div")
				.data(filterBoundedProjects(Vis.boundedProjects, day))
				.enter()
				.append("div")
				.html(function(project, i) {
					let title = document.createElement("div");
					title.innerText = project.name;
					
					let colorScale = d3.scaleOrdinal()
						.domain( [...project.progress.keys()])
						.range(d3.schemeSet3);

					let progressBar = document.createElement("div");
					progressBar.classList.add("progress-bar");
					for (let [idx, progress] of project.progress.entries()) {
						let segment = document.createElement("span");
						segment.classList.add("progress-segment");
						if (idx == 0)
							segment.style.width = `${(progress.parts / project.parts) * 100}%`;
						else
							segment.style.width = `${(progress.parts - project.progress[idx - 1].parts) / project.parts * 100}%`;
						segment.style.backgroundColor = colorScale(idx);
						progressBar.appendChild(segment);
					}
					return title.outerHTML + progressBar.outerHTML;
				})
				.attr("class", (project, i) => {
					if (typeof project.status != "undefined")
						return `project-status-${project.status}`
					else
						return ""
				});

		});
	});
