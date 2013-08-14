whatIsTheClosest!
================

###What it does###
*Enter an address and get the closest item.  My example uses hydrants and Fire stations
*Returns a map and inforamtion about the closest item along with distance.


#Setup Instructions#
###Required###
* ArcGIS server 10+  rest api and network anlyst extension
	*A service with networking enabled so you will have to build a network in ArcGIS
* Leaflet
* Jquery
* Twiiter Bootstrap



###Open the index.html file find the lines:###
    This is for networking analyst
    	var agsServerNetwork='coa-gis-imagery'
    	var agsServerInstanceNameNetwork='COA_Internal_ArcGIS'
    
    This is for geocoding
    	var agsServerGeocode='gis.ashevillenc.gov'
    	var agsServerInstanceNameGeocode='COA_ArcGIS_Server'

chamnge the information to match your ArcGIS server and Instance.
