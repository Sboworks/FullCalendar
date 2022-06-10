
public with sharing class FullCalendarController {

    public class EventException extends Exception {}
    @AuraEnabled(cacheable=true)
    public static List<Event_SFhub__c> fetchEvents() {
        return [SELECT Id,Subject__c,StartDateTime__c,IsAllDayEvent__c,EndDateTime__c,Description__c,Color__c
                FROM Event_SFhub__c 
                ORDER BY CreatedDate DESC
                LIMIT 100];
    }
    @AuraEnabled(cacheable=true)
    public static List<copado__Release__c> fetchRelease() {
        return [SELECT Id,Name,copado__Planned_Date__c
                FROM copado__Release__c 
                ORDER BY CreatedDate DESC
                LIMIT 10];
    }

    @AuraEnabled
    public static List<Event_SFhub__c> fetchEventIds(String title){

        return [SELECT Id,Subject__c,StartDateTime__c,IsAllDayEvent__c,EndDateTime__c,Description__c,Color__c
        FROM Event_SFhub__c 
        WHERE Subject__c=:title
        ORDER BY CreatedDate DESC
        LIMIT 100];
    }
  
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(){
        List<String> pickListValuesList= new List<String>();
         Schema.DescribeFieldResult fieldResult = Event_SFhub__c.Subject__c.getDescribe();
         List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
         for( Schema.PicklistEntry pickListVal : ple){
             pickListValuesList.add(pickListVal.getLabel());
         }     
         return pickListValuesList;
     }
}