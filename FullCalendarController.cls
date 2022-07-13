
public with sharing class FullCalendarController {
    @AuraEnabled(cacheable=true)
    public static List<Salesforce_Calendar__c> fetchEvents() {
        return [SELECT Id,Type__c,StartDateTime__c,IsAllDayEvent__c,EndDateTime__c,Description__c,Colour__c
                FROM Salesforce_Calendar__c 
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
    public static List<Salesforce_Calendar__c> fetchEventIds(String title){

        return [SELECT Id,Type__c,StartDateTime__c,IsAllDayEvent__c,EndDateTime__c,Description__c,Colour__c
        FROM Salesforce_Calendar__c 
        WHERE Type__c=:title
        ORDER BY CreatedDate DESC
        LIMIT 100];
    }
  
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(){
        List<String> pickListValuesList= new List<String>();
         Schema.DescribeFieldResult fieldResult = Salesforce_Calendar__c.Type__c.getDescribe();
         List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
         for( Schema.PicklistEntry pickListVal : ple){
             pickListValuesList.add(pickListVal.getLabel());
         }     
         return pickListValuesList;
     }
}