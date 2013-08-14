whatIsTheClosest!
================

###What it does###

Enter an address and get the closest item.  
My example uses hydrants and Fire stations
Returns a map and information about the closest item along with distance.


#Setup Instructions#
###Required###
* ArcGIS server 10+  rest api 
	* network anlyst extension
	* A map service with networking enabled.  
		* This means you will have to build a network in ArcGIS. 
	* Cosest facility Problem must exist in a map service
* Leaflet
* Jquery
* Twiiter Bootstrap


###Open the index.html file find the lines:###
	
	Change the following to match your ArcGIS server setup
		//setup 
		//This is for netorking
		var agsServerNetwork='coa-gis-imagery'; //ArcGIS  server name for networking
		var agsServerInstanceNameNetwork='COA_Internal_ArcGIS'; //ArcGIS  server instance for networking
		//hyrdrants
		var HydrantLayerIDX='0'; //layer index  for hydrants
		var HydrantNameField='facilityid'; //Field for name in hydrant layer
		var HydrantDistance=500; //Distance  to get hydrants around address this helps with performance

		//Fire stations
		var FireStationIDX='1'; //layer index  for fire stations
		var FireStationNameField='label'; //Field for name in fire station layer
		var FireStationDistance=15000; //Distance  to get fire stations around address  this helps with performance
		var RoutingServiceName='test_route'; //name of the map service containing  network and the closest facility problem


		//This is for geocoding
		var agsServerGeocode='gis.ashevillenc.gov'; //ArcGIS  server name for geocoding
		var agsServerInstanceNameGeocode='COA_ArcGIS_Server'; //ArcGIS  server instance for geocoding
		var geocdingLayerName='Buncombe_Streets_With_Zip'; //geocoding service to use.

		var mySRID=2264 //your projection id