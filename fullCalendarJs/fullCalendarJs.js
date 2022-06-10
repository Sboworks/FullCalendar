import { LightningElement, track, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import fetchEvents from '@salesforce/apex/FullCalendarController.fetchEvents';
import fetchEventIds from '@salesforce/apex/FullCalendarController.fetchEventIds';
import getPicklistValues from '@salesforce/apex/FullCalendarController.getPicklistValues';
import fetchRelease from '@salesforce/apex/FullCalendarController.fetchRelease';
import { refreshApex } from '@salesforce/apex';

/**
 * @description: FullcalendarJs class with all the dependencies
 */
export default class FullCalendarJs extends LightningElement {
    //To avoid the recursion from renderedcallback
    fullCalendarJsInitialised = false;

    //Fields to store the event data -- add all other fields you want to add
    bool=true;
    results=[];
    realeaseResults=[];
    releaseEvent=[];
    @track titles=[];
    @track eventTitle
    title;
    startDate;
    endDate;
    description;
    Type;
    checkboxVal=null;
    @track selectedEvent = undefined;
    eventsRendered = false;//To render initial events only once
    openSpinner = false; //To open the spinner in waiting screens
    openModal = false; //To open form
    @track color=null;
    @track CustomClass=null;
    @track
    events = []; //all calendar events are stored in this field

    //To store the orignal wire object to use in refreshApex method
    eventOriginalData = [];
    
    
    
    //Get data from server - in this example, it fetches from the event object
    @wire(fetchEvents)
    eventObj(value){
        this.eventOriginalData = value; //To use in refresh cache
         
        const {data, error} = value;
        if(data){
            //format as fullcalendar event object
            console.log(data);
            let events = data.map(event => {
              
                return { id : event.Id, 
                        title : event.Subject__c, 
                        type:event.Type__c,
                        description:event.Description__c,
                        start : event.StartDateTime__c,
                        end : event.EndDateTime__c,
                        color:event.Color__c,
                        allDay : event.IsAllDayEvent__c};
            });
            this.getPicklist();
            this.getRelease();
          
            this.events = JSON.parse(JSON.stringify(events));
            console.log('original events'+this.events);
            this.error = undefined;
          

            //load only on first wire call - 
            // if events are not rendered, try to remove this 'if' condition and add directly 
            
                //Add events to calendar
                const ele = this.template.querySelector("div.fullcalendarjs");
                $(ele).fullCalendar('renderEvents', this.events, true);
                this.eventsRendered = true;
                
            
            
        }else if(error){
            this.events = [];
            this.error = 'No events are found';
        }
   }

   /**
    * Load the fullcalendar.io in this lifecycle hook method
    */
    renderedCallback() {
      // Performs this operation only on first render
      if (this.fullCalendarJsInitialised) {
         return;
      }
      this.fullCalendarJsInitialised = true;
      
      // Executes all loadScript and loadStyle promises
      // and only resolves them once all promises are done
      Promise.all([
        loadStyle(this, FullCalendarJS + '/fullcalendar.css'),
        loadStyle(this, FullCalendarJS + '/fullcalendar.min.css'),
        loadStyle(this, FullCalendarJS + '/fullcalendar.print.min.css'),
        loadScript(this, FullCalendarJS + '/moment.min.js'),
        loadScript(this, FullCalendarJS + '/jquery.min.js'),
        loadScript(this, FullCalendarJS + '/jquery-ui.min.js'),
        loadScript(this, FullCalendarJS + '/fullcalendar.min.js'),
        
        
      ])
        .then(() => {
            //initialize the full calendar
        this.initialiseFullCalendarJs();
        })
        .catch((error) => {
        console.error({
            message: "Error occured on FullCalendarJS",
            error,
        });
        });
   }

    initialiseFullCalendarJs() {
      
        const ele = this.template.querySelector("div.fullcalendarjs");
        const modal = this.template.querySelector('div.modalclass');
        console.log(FullCalendar);
        
        var self = this;
          
        //To open the form with predefined fields
        //TODO: to be moved outside this function
        function openActivityForm(startDate, endDate){
            self.startDate = startDate;
            self.endDate = endDate;
            self.openModal = true;
        }
        //Actual fullcalendar renders here - https://fullcalendar.io/docs/v3/view-specific-options
        $(ele).fullCalendar({
            header: {
                left: "prev,next today",
                center: "title",
                right: "month,agendaWeek,agendaDay",
            },
            timeFormat: 'h(:mm)A',
            displayEventTime: true,
            eventClick: this.eventClickHandler.bind(this),
            defaultDate: new Date(), // default day is today - to show the current date
            defaultView : 'month', //To display the default view - as of now it is set to week view
            navLinks: true, // can click day/week names to navigate views
            // editable: true, // To move the events on calendar - TODO 
            selectable: true, //To select the period of time
            //To select the time period : https://fullcalendar.io/docs/v3/select-method
            select: function (startDate, endDate) {
                let stDate = startDate.format();
                let edDate = endDate.format();
                
                openActivityForm(stDate, edDate);
            },
            
            eventLimit: true, // allow "more" link when too many events
            events: this.events, // all the events that are to be rendered - can be a duplicate statement here
        });
        
    }
     
    //TODO: add the logic to support multiple input texts
    handleKeyup(event) {
       this.title = event.target.value;
    }
    
    //To close the modal form
    handleCancel(event) {
        this.openModal = false;
    }
    getPicklist(){
        getPicklistValues()
        .then(response=>{
            this.titles=response;
                console.log(this.titles);
        })
        .catch(error=>{
            this.errors=error;
    });
    }
    eventing =[];
   handleChange(event){
    let eventTitle = event.target.value;
    const ele = this.template.querySelector("div.fullcalendarjs");
    if(eventTitle=='Release Dates'){
        let resp= this.releaseEvent.map(x => {
            return this.realeaseResults=x.id;
          });
        console.log('release date has been clicked:'+resp);
        for (let i = 0; i < resp.length; i++) {
            $(ele).fullCalendar( 'removeEvents', resp[i]);
          }
    }
    var selected = event.target.checked;
    if(selected==false){
       
    fetchEventIds({title:eventTitle})
    .then(results=>{
      let res= results.map(x => {
        return this.results=x.Id;
      });
        console.log('res'+res);
        
        for (let i = 0; i < res.length; i++) {
            $(ele).fullCalendar( 'removeEvents', res[i]);
          }
            
        
          
    })
    .catch(error=>{
            this.errors=error;
    });
     
}
}

getRelease(){
fetchRelease()
    .then(results=>{
        let events = results.map(event => {
              
            return { id : event.Id, 
                    title : event.Name, 
                    start : event.copado__Planned_Date__c,
                    end : event.copado__Planned_Date__c,
                    color:'green',
                    allDay :true};
        });
        const ele = this.template.querySelector("div.fullcalendarjs");
                $(ele).fullCalendar('renderEvents', events, true);
                this.eventsRendered = true;
                this.releaseEvent=events;
        console.log('releases'+JSON.stringify(events));
       
        
            
        
          
    })
    .catch(error=>{
            this.errors=error;
    });
}

handleResetAll(event){
  let eventid = event.target.value;
    
  const ele = this.template.querySelector("div.fullcalendarjs");
  $(ele).fullCalendar( 'removeEvents');
  $(ele).fullCalendar('renderEvents',this.events,true);
  $(ele).fullCalendar('renderEvents',this.releaseEvent,true);
  this.bool=false;
 this.bool=true;
  
}

 myEventColor(status) {
  
  if(status === 'Special Events'){
      return '#9c7a97'; 
  }
  else if(status=='Training' ){
    return '#7EA2AA'; 
  }
  else if (status === 'Salesforce Masterclasses') {
      return '#8BE8CB';
  } else if (status === 'PI Dates') {
      return '#303633';
  } else  {  //Cancelled 
      return '#9C7A97';
  } 
} 

    /**
     * @description method to show toast events
     */
    showNotification(title, message, variant) {
        console.log('enter');
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    eventClickHandler(event){
      this.selectedEvent=event;
  }
  closeModal(){
    this.selectedEvent = undefined;
  }
}