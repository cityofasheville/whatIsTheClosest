whatIsTheClosest!
================

###What it does###

Enter an address and get the closest item.  
My example uses hydrants and Fire stations
Returns a map and inforamtion about the closest item along with distance.


#Setup Instructions#
###Required###
* ArcGIS server 10+  rest api 
	* network anlyst extension
	* A map service with networking enabled.  This means you will have to build a network in ArcGIS. 
	* Cosest facility Problem map service
* Leaflet
* Jquery
* Twiiter Bootstrap



###Open the index.html file find the lines:###
   //setup 
   * Change the following to match your ArcGIS server setup
      //This is for netorking      
      var agsServerNetwork='coa-gis-imagery'; //arcgis server name for networking
      var agsServerInstanceNameNetwork='COA_Internal_ArcGIS'; //arcgis server instance for networking
      var HydrantLayerIDX='0'; //layer index  for hydrants
      var ClosestFireStationIDX='1'; //layer index  for firestations
      var RoutingServiceName='test_route'; //name of the map service containg network and the closest facility problem

      //This is for geocoding
      var agsServerGeocode='gis.ashevillenc.gov'; //arcgis server name for geocoding
      var agsServerInstanceNameGeocode='COA_ArcGIS_Server'; //arcgis server instance for geocoding
      var geocdingLayerName='Buncombe_Streets_With_Zip'; //geocoding service to use.

      var mySRID=2264 //your projection id
