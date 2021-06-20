import css from "./src/index.css";

function Event(date, label) {
  this.date = date;
  this.label = label;

  this.dayElem = undefined;
  this.eventElem = undefined;
}

function Calendar(hostElem, id) {
  this.hostElem = hostElem;
  this.id = id;

  this.today = undefined;

  this.currentDate = undefined;
  this.clickedDate = undefined;

  this.firstDayInCurrentMonth = undefined;
  this.lastDayInCurrentMonth = undefined;
  this.firstDayOfFirstWeekInMonth = undefined;
  this.lastDayOfLastWeekInMonth = undefined;

  this.events = [];

  this.modalElem = undefined;
  this.currentlyEditedEvent = undefined;

  this.init = function() {
    //console.log('outputCurrentMonth()');

    this.today = new Date();
    this.currentDate = this.today;

    this.computeDates(this.currentDate);

    let prevButton = document.getElementById('prev');
    let nextButton = document.getElementById('next');

    prevButton.addEventListener('click', (e) => {
      this.prevButtonHandler();
    });
    nextButton.addEventListener('click', (e) => {
      this.nextButtonHandler();
    });

    // Get the modal
    this.modalElem = document.getElementById("editModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = () => {
      this.modalElem.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
      if (event.target == this.modalElem) {
        this.modalElem.style.display = "none";
      }
    }

    // submit button
    let btnSubmit = this.modalElem.querySelector("#submitButton");
    btnSubmit.onclick = (event) => {
      this.modalElem.style.display = "none";
      this.modalOkBtnClickedHandler(event);
    }

    // cancel button
    let btnCancel = this.modalElem.querySelector("#cancelButton");
    btnCancel.onclick = (event) => {
      this.modalElem.style.display = "none";
      this.modalCancelBtnClickedHandler(event);
    }

    // delete button
    let btnDelete = this.modalElem.querySelector("#deleteButton");
    btnDelete.onclick = (event) => {
      this.modalElem.style.display = "none";
      this.modalDeleteBtnClickedHandler(event);
    }
  }

  this.modalOkBtnClickedHandler = function(event) {
    let labelInput = this.modalElem.querySelector("#labelInput");
    //console.log(`labelInput.value: ${labelInput.value}`);

    if (!labelInput.value) {
      console.log('Not adding event without label!');
      this.currentlyEditedEvent = undefined;
      return;
    }

    if (this.currentlyEditedEvent) {

      //console.log(`update ${this.currentlyEditedEvent.label} to ${labelInput.value}`);

      this.currentlyEditedEvent.label = labelInput.value;

      // update the DOM
      this.currentlyEditedEvent.eventElem.innerHTML = labelInput.value;

    } else {

      let newEvent = {
        date: this.clickedDate,
        label: labelInput.value,
      }

      this.events.push(newEvent);

      // add
      let divChildren = this.hostElem.querySelectorAll("div");
      let dayElementDiv = Array.from(divChildren).filter(divElem => divElem.date ? this.sameDay(divElem.date, newEvent.date) : false);
      if (dayElementDiv.length > 0) {
        this.addEventToDay(dayElementDiv[0], newEvent);
      }
    }

    this.currentlyEditedEvent = undefined;
  }

  this.modalCancelBtnClickedHandler = function(event) {
    this.currentlyEditedEvent = undefined;
  }

  this.modalDeleteBtnClickedHandler = function(event) {

    if (!this.currentlyEditedEvent) {
      return;
    }

    if (!confirm('Do you really want to delete the object?')) {
      return;
    }

    // remove event from the events array
    const index = this.events.indexOf(this.currentlyEditedEvent);
    if (index > -1) {
      this.events.splice(index, 1);
    }

    // remove the event DOM element
    this.currentlyEditedEvent.dayElem.removeChild(this.currentlyEditedEvent.eventElem);

    this.currentlyEditedEvent = undefined;
  }

  this.computeDates = function(date) {
    this.firstDayInCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    this.lastDayInCurrentMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.firstDayOfFirstWeekInMonth = this.getFirstDayOfWeek(this.firstDayInCurrentMonth, true)
    this.lastDayOfLastWeekInMonth = this.getLastDayOfWeek(this.lastDayInCurrentMonth, true);

    //console.log('firstDayInCurrentMonth', this.firstDayInCurrentMonth);
    //console.log('lastDayInCurrentMonth', this.lastDayInCurrentMonth);
    //console.log('firstDayOfFirstWeekInMonth', this.firstDayOfFirstWeekInMonth);
    //console.log('lastDayOfLastWeekInMonth', this.lastDayOfLastWeekInMonth);
  }

  this.sameDay = function(d1, d2) {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  this.render = function() {

    const monthAsString = this.currentDate.toLocaleString('default', { month: 'long' });

    let monthIndicatorElem = document.getElementById('month-indicator');
    monthIndicatorElem.innerHTML = monthAsString;

    let iteratorDate = this.firstDayOfFirstWeekInMonth;
    let loopBreaker = 0;

    // comparing dates: https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
    while (iteratorDate <= this.lastDayOfLastWeekInMonth && loopBreaker < 100) {

      let dayElem = document.createElement('div');
      host.appendChild(dayElem);
      dayElem.classList.add('day');
      dayElem.innerHTML = iteratorDate.getDate();
      dayElem.date = new Date(iteratorDate);
      dayElem.addEventListener('click', (e) => {
        e.stopPropagation();
        //console.log('day clicked', e.target.date);
        this.dayElementClickedHandler(dayElem);
      });

      let controlsElem = document.createElement('div');
      dayElem.appendChild(controlsElem);
      controlsElem.classList.add("controls");
      controlsElem.innerHTML = "+";
      controlsElem.addEventListener('click', (e) => {
        e.stopPropagation();
        //console.log('add clicked');
        this.addElementClickedHandler(dayElem);
      });

      let eventsOfTheDay = this.events.filter(evt => this.sameDay(evt.date, iteratorDate));
      if (eventsOfTheDay) {
        eventsOfTheDay.forEach(evt => {
          this.addEventToDay(dayElem, evt);
        })
      }

      iteratorDate.setDate(iteratorDate.getDate() + 1);
      loopBreaker++;
    }
  }

  this.addEventToDay = function(dayElem, evt) {
    let eventElem = document.createElement('div');
    dayElem.appendChild(eventElem);
    eventElem.classList.add('event');
    eventElem.innerHTML = evt.label;
    eventElem.event = evt;
    eventElem.addEventListener('click', (e) => {
      e.stopPropagation();
      //console.log('event clicked');
      this.eventElementClickedHandler(eventElem);
    });

    evt.dayElem = dayElem;
    evt.eventElem = eventElem;
  }

  this.dayElementClickedHandler = function(dayElem) {
    console.log('dayElementClickedHandler', dayElem, dayElem.date);

    // display a modal containing a area containing all events on that day

    let eventsOnDay = this.events.filter(evt => this.sameDay(evt.date, dayElem.date));
    if (eventsOnDay && eventsOnDay.length > 0) {

      let addEventsElem = this.modalElem.querySelector("#addEvent");
      addEventsElem.style.display = "none";

      let listEventsElem = this.modalElem.querySelector("#listEvents");
      this.clearElements(listEventsElem);
      eventsOnDay.forEach(evt => {
        let eventDivElem = document.createElement("div");
        eventDivElem.innerHTML = evt.label;
        listEventsElem.appendChild(eventDivElem);
      });
      listEventsElem.style.display = "block";

      // show the modal
      this.modalElem.style.display = "block";
    }
  }

  this.eventElementClickedHandler = function(eventElement) {
    let event = eventElement.event;
    this.currentlyEditedEvent = event;

    this.clearModal();

    // TODO move this to a function called loadModal(event);
    let titleSpanElem = this.modalElem.querySelector("#addEventTitle");
    titleSpanElem.innerHTML = event.label + " " + event.date;

    let labelInputElem = this.modalElem.querySelector("#labelInput");
    labelInputElem.value = event.label;

    let addEventsElem = this.modalElem.querySelector("#addEvent");
    addEventsElem.style.display = "block";

    let listEventsElem = this.modalElem.querySelector("#listEvents");
    listEventsElem.style.display = "none";

    // show the modal
    this.modalElem.style.display = "block";
  }

  this.addElementClickedHandler = function(dayElement) {

    // say the clicked date so that it is known in the submit handler for the event modal
    this.clickedDate = dayElement.date;

    this.clearModal();

    let titleSpanElem = this.modalElem.querySelector("#addEventTitle");
    titleSpanElem.innerHTML = "New event";

    let addEventsElem = this.modalElem.querySelector("#addEvent");
    addEventsElem.style.display = "block";

    let listEventsElem = this.modalElem.querySelector("#listEvents");
    listEventsElem.style.display = "none";

    // show the modal
    this.modalElem.style.display = "block";
  }

  this.clearModal = function() {
    let titleSpanElem = this.modalElem.querySelector("#addEventTitle");
    titleSpanElem.innerHTML = "";

    let labelInput = this.modalElem.querySelector("#labelInput");
    labelInput.value = "";
  }

  // clears all divs within the host element.
  // Removes the current month so the next/prev month can be rendered.
  this.clearElements = function(elem) {
    while (elem.firstChild) {
      elem.removeChild(elem.lastChild);
    }
  }

  this.getFirstDayOfWeek = function(date, firstDayIsMonday) {

    date = new Date(date);

    // Die getDay() Methode gibt den Tag der Woche eines Datums gemäß der Ortszeit zurück,
    // wobei Sonntag durch den Wert 0 repräsentiert wird.
    let day = date.getDay();

    let diff = 0;
    if (firstDayIsMonday) {
      diff = date.getDate() - (day == 0 ? day+6 : day-1);
    } else {
      diff = date.getDate() - day;
    }
    return new Date(date.setDate(diff));
  }

  this.getLastDayOfWeek = function(date, firstDayIsMonday) {

    date = new Date(date);

    // Die getDay() Methode gibt den Tag der Woche eines Datums gemäß der Ortszeit zurück,
    // wobei Sonntag durch den Wert 0 repräsentiert wird.
    let day = date.getDay();

    let diff = 0;
    if (firstDayIsMonday) {
      diff = date.getDate() + (day == 0 ? 0 : 7-day);
    } else {
      diff = date.getDate() + 7-day;
    }
    return new Date(date.setDate(diff));
  }

  this.nextButtonHandler = function() {
    //console.log('nextButtonHandler()', this);

    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(1);
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);

    console.log(this.currentDate);

    this.computeDates(this.currentDate);
    this.clearElements(this.hostElem);
    this.render();
  }

  this.prevButtonHandler = function() {
    //console.log('prevButtonHandler()', this);

    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(1);
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);

    console.log(this.currentDate);

    this.computeDates(this.currentDate);
    this.clearElements(this.hostElem);
    this.render();
  }


}

var host = document.getElementById("cal1");

const cal1 = new Calendar(host, 'cal1');

let event1 = new Event(new Date(), 'event1');
let event2 = new Event(new Date(), 'event2');

cal1.events.push(event1);
cal1.events.push(event2);

const date = new Date(2021, 5, 10, 0, 0, 0, 0);

for (let i = 0; i < 300; i++) {
  let event = new Event(date, 'event ' + i);
  cal1.events.push(event);
}

// event = new Event(date, 'b  ');
// cal1.events.push(event);
// event = new Event(date, 'c  ');
// cal1.events.push(event);
// event = new Event(date, 'd  ');
// cal1.events.push(event);
// event = new Event(date, 'e  ');
// cal1.events.push(event);
// event = new Event(date, 'f  ');
// cal1.events.push(event);
// event = new Event(date, 'g  ');
// cal1.events.push(event);
// event = new Event(date, 'h  ');
// cal1.events.push(event);
// event = new Event(date, 'i  ');
// cal1.events.push(event);
// event = new Event(date, 'k  ');
// cal1.events.push(event);

cal1.init();
cal1.render();
