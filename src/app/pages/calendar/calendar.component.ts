import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import { category, calendarEvents, createEventId } from './data';
import { ActivityService } from '../../pages/activity/services/activity.service';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { HttpClient } from '@angular/common/http';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems: Array<{}>;

  @ViewChild('modalShow') modalShow: TemplateRef<any>;
  @ViewChild('editmodalShow') editmodalShow: TemplateRef<any>;

  formEditData: UntypedFormGroup;
  submitted = false;
  category: any[];
  newEventDate: any;
  editEvent: any;
  calendarEvents: any[];
  // event form
  formData: UntypedFormGroup;
  currentUserProfile: any;

  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'dayGridMonth,dayGridWeek,dayGridDay',
      center: 'title',
      right: 'prevYear,prev,next,nextYear'
    },
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
    initialEvents: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.openModal.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: true
    }
  };
  currentEvents: EventApi[] = [];

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'HRM' }, { label: 'Calendar', active: true }];

    this.formData = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
    });

    this.formEditData = this.formBuilder.group({
      editTitle: ['', [Validators.required]],
      editCategory: [],
    });
    
    this._fetchData();
    this.loadUserActivities();
  }

  /**
   * Event click modal show
   */
  handleEventClick(clickInfo: EventClickArg) {
    this.editEvent = clickInfo.event;
    const activityData = clickInfo.event.extendedProps?.activityData;
    
    if (activityData) {
      // If it's an activity event, show detailed info
      let activityDetails = '';
      let statusClass = '';
      
      // Set status badge class
      switch (activityData.status) {
        case 'PENDING':
          statusClass = 'badge bg-warning';
          break;
        case 'APPROVED':
          statusClass = 'badge bg-success';
          break;
        case 'REJECTED':
          statusClass = 'badge bg-danger';
          break;
        default:
          statusClass = 'badge bg-info';
      }
      
      // Format dates for display
      const startTime = new Date(activityData.startTime).toLocaleString();
      const endTime = new Date(activityData.endTime).toLocaleString();
      
      // Parse requestFlds to get additional details
      let additionalDetails = '';
      if (activityData.requestFlds) {
        try {
          const requestFldsObj = JSON.parse(activityData.requestFlds);
          Object.entries(requestFldsObj).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && 'fieldName' in value && 'value' in value) {
              additionalDetails += `<div><strong>${value.fieldName}:</strong> ${value.value}</div>`;
            }
          });
        } catch (e) {
          console.error('Error parsing requestFlds:', e);
        }
      }
      
      // Create activity details HTML
      activityDetails = `
        <div class="mt-3">
          <div class="mb-2"><strong>Status:</strong> <span class="${statusClass}">${activityData.status}</span></div>
          <div class="mb-2"><strong>Start Time:</strong> ${startTime}</div>
          <div class="mb-2"><strong>End Time:</strong> ${endTime}</div>
          ${additionalDetails}
        </div>
      `;
      
      // Show activity details in a modal
      Swal.fire({
        title: clickInfo.event.title,
        html: activityDetails,
        icon: 'info',
        confirmButtonText: 'Close'
      });
      return;
    }
    
    // For regular calendar events, show the edit modal
    var category = clickInfo.event.classNames;
    this.formEditData = this.formBuilder.group({
      editTitle: clickInfo.event.title,
      editCategory: category instanceof Array ? clickInfo.event.classNames[0] : clickInfo.event.classNames,
    });
    this.modalRef = this.modalService.show(this.editmodalShow);
  }

  /**
   * Events bind in calander
   * @param events events
   */
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private activityService: ActivityService,
    private http: HttpClient
  ) {}

  get form() {
    return this.formData.controls;
  }

  /**
   * Delete-confirm
   */
  confirm() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.value) {
        this.deleteEventData();
        Swal.fire('Deleted!', 'Event has been deleted.', 'success');
      }
    });
  }

  position() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Event has been saved',
      showConfirmButton: false,
      timer: 1000,
    });
  }

  /**
   * Event add modal
   */
  openModal(event?: any) {
    this.newEventDate = event;
    this.modalRef = this.modalService.show(this.modalShow);
  }

  /**
   * save edit event data
   */
  editEventSave() {
    const editTitle = this.formEditData.get('editTitle').value;
    const editCategory = this.formEditData.get('editCategory').value;

    const editId = this.calendarEvents.findIndex(
      (x) => x.id + '' === this.editEvent.id + ''
    );

    this.editEvent.setProp('title', editTitle);
    this.editEvent.setProp('classNames', editCategory);

    this.calendarEvents[editId] = {
      ...this.editEvent,
      title: editTitle,
      id: this.editEvent.id,
      classNames: editCategory + ' ' + 'text-white',
    };

    this.position();
    this.formEditData = this.formBuilder.group({
      editTitle: '',
      editCategory: '',
    });
    this.modalService.hide();
  }

  /**
   * Delete event
   */
  deleteEventData() {
    this.editEvent.remove();
    this.modalService.hide();
  }

  /**
   * Close event modal
   */
  closeEventModal() {
    this.formData = this.formBuilder.group({
      title: '',
      category: '',
    });
    this.modalService.hide();
  }

  /**
   * Save the event
   */
  saveEvent() {
    if (this.formData.valid) {
      const title = this.formData.get('title').value;
      const className = this.formData.get('category').value;
      const calendarApi = this.newEventDate.view.calendar;
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: this.newEventDate.date,
        end: this.newEventDate.date,
        className: className + ' ' + 'text-white'
      });
      this.position();
      this.formData = this.formBuilder.group({
        title: '',
        category: '',
      });
      this.modalService.hide();
    }
    this.submitted = true;
  }

  /**
   * Load activity data from API for the current user
   */
  loadUserActivities() {
    try {
      const userProfileData = localStorage.getItem('currentUserProfile');
      if (userProfileData) {
        this.currentUserProfile = JSON.parse(userProfileData);
        const employeeId = this.currentUserProfile.employeeID;
        
        if (employeeId) {
          const params = {
            EmployeeIdList: employeeId
          };
          
          this.activityService.getActivities(params).subscribe(
            (activities) => {
              console.log('Activities loaded:', activities);
              
              // Map activities to calendar events
              const events = activities.map(activity => {
                // Parse requestFlds to get task name
                let taskName = '';
                if (activity.requestFlds) {
                  try {
                    const requestFldsObj = JSON.parse(activity.requestFlds);
                    // Look for any field that might contain task information
                    const taskField = Object.values(requestFldsObj).find((field: any) => 
                      field.fieldName === 'TaskName' || field.fieldName === 'Lý do' || field.fieldType === 'Text'
                    );
                    
                    if (taskField && typeof taskField === 'object' && 'value' in taskField) {
                      taskName = (taskField.value as string) || '';
                    }
                  } catch (e) {
                    console.error('Error parsing requestFlds:', e);
                  }
                }
                
                // Determine event color based on status
                let colorClass;
                switch (activity.status) {
                  case 'PENDING':
                    colorClass = 'bg-warning';
                    break;
                  case 'APPROVED':
                    colorClass = 'bg-success';
                    break;
                  case 'REJECTED':
                    colorClass = 'bg-danger';
                    break;
                  default:
                    colorClass = 'bg-info';
                }
                
                // Get activity type name if available
                const activityType = activity.activityId || 'Activity';
                
                const title = taskName || activityType || 'Activity';
                
                return {
                  id: activity.requestId,
                  title: title,
                  start: activity.startTime,
                  end: activity.endTime,
                  className: colorClass + ' text-white',
                  extendedProps: {
                    activityData: activity
                  }
                };
              });
              
              // Update calendar with the fetched events
              const calendarApi = this.calendarOptions.events = events;
            },
            (error) => {
              console.error('Error loading activities:', error);
            }
          );
        } else {
          console.error('Employee ID not found in user profile');
        }
      } else {
        console.error('User profile not found in localStorage');
      }
    } catch (error) {
      console.error('Error processing user profile:', error);
    }
  }

  /**
   * Fetches the data
   */
  private _fetchData() {
    // Event category
    this.category = category;
    // Calender Event Data
    this.calendarEvents = [];
    // form submit
    this.submitted = false;
  }
}
