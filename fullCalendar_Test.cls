@isTest
public with sharing class fullCalendar_Test {
    @testSetup static void setup() {
        List<Salesforce_Calendar__c> events = new List<Salesforce_Calendar__c>();
        Datetime dt = Datetime.newInstance(2022, 2, 17);
        Datetime dt2 = dt.addDays(2);
        
            events.add(new Salesforce_Calendar__c (Type__c = 'Masterclasses', StartDateTime__c =dt,IsAllDayEvent__c =true,
            EndDateTime__c =dt2,Description__c ='event open',Colour__c ='red'));
        
            insert events;

            List<copado__Release__c> release = new List<copado__Release__c>();
        Date dat = Date.newInstance(2022, 2, 17);
    
        release.add(new copado__Release__c (name = 'Internal Releases', copado__Planned_Date__c =dat));
       
            
        insert release;


    }
    static testMethod void fetchEvents_Test() {
        
         Test.startTest();
        FullCalendarController.fetchEvents();
        Test.stopTest();
        Salesforce_Calendar__c cal= [SELECT Id,Type__c,StartDateTime__c,IsAllDayEvent__c,EndDateTime__c,Description__c,Colour__c
                FROM Salesforce_Calendar__c 
                WHERE Colour__c='red'
                ORDER BY CreatedDate DESC
                LIMIT 1];
        System.assertNotEquals(null, cal.Type__c);
       
       
    }
    static testMethod void fetchRelease_Test() {
        Test.startTest();
        FullCalendarController.fetchRelease();
        Test.stopTest();
        copado__Release__c rel=[SELECT Id,Name,copado__Planned_Date__c
                FROM copado__Release__c 
                ORDER BY CreatedDate DESC
                LIMIT 1];
        System.assertNotEquals(null, rel.copado__Planned_Date__c);
    }
    static testMethod void fetchEventIds_Test() {
       
        Test.startTest();
        FullCalendarController.fetchEventIds('Masterclasses');
        Test.stopTest();
        Salesforce_Calendar__c cal= [SELECT Id,Type__c,StartDateTime__c,IsAllDayEvent__c,EndDateTime__c,Description__c,Colour__c
                FROM Salesforce_Calendar__c 
                WHERE Colour__c='red'
                ORDER BY CreatedDate DESC
                LIMIT 1];
        System.assertNotEquals(null, cal.Type__c);
    }
    static testMethod void getPicklistValues_Test() {
         

    	Test.startTest();
            List<String> types = FullCalendarController.getPicklistValues();
        Test.stopTest();
      
        system.assertEquals(types.get(4), 'Masterclasses');
    }
}


