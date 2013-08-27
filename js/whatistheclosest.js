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

      var facilitytimeout=7000 //time out for looking for facilites.  
                               //This is hapened for data in internal servers...
                               
      var mySRID=2264 //your projection id

    function UpdateResults(someData,idStr){
      $('#results').append('<span  class="text-success" ><strong>' + someData.candidates[0].address + '</strong></span>');
    }

    function getLatLong(someData){
      xStr=someData.candidates[0].location.x;
      yStr=someData.candidates[0].location.y;
      var urlStr = 'http://'+agsServerNetwork+'/'+agsServerInstanceNameNetwork+'/rest/services/Geometry/GeometryServer/project';
      var aPt='{"x":'+xStr+',"y":'+yStr+'}';

      var data={f:"json",inSR:mySRID,outSR:4326,geometries:aPt};

       $.ajax({
           url: urlStr,
           dataType: 'jsonp',
           data:data,
           crossDomain: true,
           success:function(data){zoomMap(data);},
           error:function(x,t,m){updateResultsFail(t,'Error with transforming to WGS84!');}
       });
     }

     var zoomMap = function(data){
      xStr=data.geometries[0].x;
      yStr=data.geometries[0].y;
      map.setView(new L.LatLng(yStr, xStr), 15);
      return '';
    }

    function getAddress(closestType,distance){
       clearMap();
       $('#results').html('');
       $('#loading').css('visibility','visible')
       addressStr = $('#address').val();
       ZipStr = $('#zone').val();
       var urlStr = 'http://'+agsServerGeocode+'/'+agsServerInstanceNameGeocode+'/rest/services/'+geocdingLayerName+'/GeocodeServer/findAddressCandidates';
       var data={f:"json",Street:addressStr,Zone:ZipStr};

       $.ajax({
           url: urlStr,
           dataType: 'jsonp',
           data:data,
           crossDomain: true,
           success:function(data){getResults(data,closestType,distance);},
           error:function(x,t,m){updateResultsFail(t,'Failed to get address!');}//console.log('ajax failed');}
       });
     }

     function drawRoute(data){
       var geojsonGroup = new L.LayerGroup();
       
       var path=data.routes.features[0].geometry.paths[0]
       var myLines = '[{"type": "LineString","coordinates":['
       for(var i=0;i< data.routes.features[0].geometry.paths.length;i++)
       {
            for(var j=0;j< data.routes.features[0].geometry.paths[i].length;j++){
                myLines += '['+data.routes.features[0].geometry.paths[i][j]+'],'
            }
       }
       
       myLines=myLines.substring(0, myLines.length-1)
       myLines += ']}]'
       myJsonObject=JSON.parse(myLines);
       
       var startPt = '[{"type": "Point","coordinates":['+data.routes.features[0].geometry.paths[0][0]+']}]';
       var endPt = '[{"type": "Point","coordinates":['+data.routes.features[0].geometry.paths[0][(data.routes.features[0].geometry.paths[0].length-1)]+']}]'

       var myStyle = {
           "color": "#C09853",
           "weight": 10,
           "opacity": 0.65
       };

       geoJSONLayer = L.geoJson(myJsonObject, {
           style: myStyle
       });
       
       var bounds = geoJSONLayer.getBounds();
       geoJSONLayer.addTo(map);
       drawPoints(startPt,'start');
       drawPoints(endPt,'end');
       map.fitBounds(bounds,100);
       map.zoomOut(1);    
    }
    
    function getColor(type){
        switch (type) {
            case 'start':
                return "#468847";
            case 'end':
                return "#B94A48";
            default:  
                return "#ff7800";
                break;
        }   
    }
    
    
    function drawPoints(GJfeat,type){
        GJfeatObject=JSON.parse(GJfeat);
        var geojsonMarkerOptions = {
            radius: 8,
            fillColor: getColor(type),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
            
        };
        
        var gjPT = L.geoJson(GJfeatObject, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        });

       gjPT.addTo(map);
           
    }
    
    function clearMap() {
        for(i in map._layers) {
            if(map._layers[i]._path != undefined) {
                try {
                    map.removeLayer(map._layers[i]);
                }
                catch(e) {
                    //do nothing....
                }
            }
        }
    }
        
    function makeFacilityEnvelope(someData,distance){

	   xStr=someData.candidates[0].location.x;
	   yStr=someData.candidates[0].location.y;
	   
	   maxX=parseFloat(parseFloat(xStr)+parseFloat(distance));
	   maxY=parseFloat(parseFloat(yStr)+parseFloat(distance));

	   minX=parseFloat(parseFloat(xStr)-parseFloat(distance));
	   minY=parseFloat(parseFloat(yStr)-parseFloat(distance));
	   
	   retVal='{"xmin":'+minX+',"ymin":'+minY+',"xmax":'+maxX+',"ymax":'+maxY+',"spatialReference":{"wkid":'+mySRID+'}}';
     
	   return retVal;
    }//makeFacilityEnvelope
    
    function getFacilities(someData,closestType,distance){
      var mainURL = 'http://'+agsServerNetwork+'/'+agsServerInstanceNameNetwork+'/rest/services/Publish/'+RoutingServiceName+'/MapServer/';

      switch(closestType){
        case 'ClosestFireStation':
          facEnv=makeFacilityEnvelope(someData,FireStationDistance);
          var urlStr = mainURL+FireStationIDX+'/query';
          var jobj = {f:"json",outSR:mySRID,inSR:mySRID,geometry:facEnv,geometryType:"esriGeometryEnvelope",spatialRel:"esriSpatialRelEnvelopeIntersects",outFields:"replacenamefield"};
          var jsonstr = JSON.stringify(jobj);
          jsonstr = jsonstr.replace("replacenamefield",FireStationNameField);
          jobj = $.parseJSON(jsonstr, true);          
          var data = jobj;
          break;
        case 'ClosestHydrant':
          facEnv=makeFacilityEnvelope(someData,HydrantDistance);
          var urlStr = mainURL+HydrantLayerIDX+'/query';          
          var jobj = {f:"json",outSR:mySRID,inSR:mySRID,geometry:facEnv,geometryType:"esriGeometryEnvelope",spatialRel:"esriSpatialRelEnvelopeIntersects",outFields:"replacenamefield"};
          var jsonstr = JSON.stringify(jobj);
          jsonstr = jsonstr.replace("replacenamefield",HydrantNameField);
          jobj = $.parseJSON(jsonstr, true);          
          var data = jobj;
          break;
        default:  
          facEnv=makeFacilityEnvelope(someData,FireStationDistance);
          var urlStr = mainURL+FireStationIDX+'/query';
          var jobj = {f:"json",outSR:mySRID,inSR:mySRID,geometry:facEnv,geometryType:"esriGeometryEnvelope",spatialRel:"esriSpatialRelEnvelopeIntersects",outFields:"replacenamefield"};
          var jsonstr = JSON.stringify(jobj);
          jsonstr = jsonstr.replace("replacenamefield",FireStationNameField);
          jobj = $.parseJSON(jsonstr, true);          
          var data = jobj;
          break;
        }//switch        
        
        $.ajax({
          url: urlStr,
          dataType: 'jsonp',
          data:data,
          crossDomain: true,
          success:function(data){makeFacilityList(data,someData,closestType,distance);},
          error:function(x,t,m){updateResultsFail(t,'Failed to find facilities for '+closestType+'!');},
          timeout:facilitytimeout
        });        
        
        return urlStr;
    }//getFacilities
    
    function getClosest(someData,fac,closestType,distance){
         
       addressStr = $('#address').val();
       ZipStr = $('#zone').val();
       xStr=someData.candidates[0].location.x;
       yStr=someData.candidates[0].location.y;
	   
	     var urlStr = 'http://'+agsServerNetwork+'/'+agsServerInstanceNameNetwork+'/rest/services/Publish/'+RoutingServiceName+'/NAServer/'+closestType+'/solveClosestFacility';
       var data = {f:"json",outSR:4326,returnFacilities:false,returnIncidents:false,incidents:xStr+','+yStr,facilities:fac};      
      
       $.ajax({
           url: urlStr,
           dataType: 'jsonp',
           data:data,
           crossDomain: true,
           success:function(data){dispResults(data,distance,closestType);},
           error:function(x,tm){updateResultsFail(t,'Failed to get closeset facility!');}
       });
       
   }//getClosest
   
    
    var updateResultsFail = function(t,amsg){
      if(t==="timeout") {
        $('#loading').css('visibility','hidden');
        $('#results').append('<span  class="text-danger" ><strong> Unable to complete!<br />'+
                            'Maybe you cannot access the data feeds?</strong></span>');        
      }else{
        $('#loading').css('visibility','hidden');
        $('#results').append('<span  class="text-danger" ><strong>' + amsg + '</strong></span>');
      }
    }//updateResultsFail

   var getResults = function(data,closestType,distance){
        
        if(data.candidates.length==0){
          updateResultsFail('','No matching addresses!');
        }else{
          UpdateResults(data);
          getFacilities(data,closestType,distance)
        }
        
        return data;
        
    }//getResults
       
    var makeFacilityList = function(data,someData,closestType,distance){

        theFacs='{"features":[';
        if (data.features.length == 0){
          $('#loading').css('visibility','hidden');
          $('#results').append('<span  class="text-danger" ><strong>Unable to find any Closest Locations!  <br/>'+
                                'You may not have access to the locations data or there are none.</strong></span>');
        }else{
          for(var i=0;i< data.features.length;i++){
             switch(closestType)
                  {
                  case 'ClosestFireStation':
                      theFacs+='{"geometry":{"x":'+data.features[i].geometry.x+',"y":'+data.features[i].geometry.y+'},"attributes":{"Name":"'+data.features[i].attributes.label+'"}},';
                      break;
                  case 'ClosestHydrant':
                      theFacs+='{"geometry":{"x":'+data.features[i].geometry.x+',"y":'+data.features[i].geometry.y+'},"attributes":{"Name":"'+data.features[i].attributes.facilityid+'"}},';
                      break;   
                  default:  
                      theFacs+='{"geometry":{"x":'+data.features[i].geometry.x+',"y":'+data.features[i].geometry.y+'},"attributes":{"Name":"'+data.features[i].attributes.label+'"}},';
                      break;
                  }//switch
          }
          theFacs=theFacs.substring(0, theFacs.length-1); 
          theFacs=theFacs+']}';
          getClosest(someData,theFacs,closestType,distance);
      }
    }//makeFacilityList

    var dispResults = function(data,distance,closestType){
        $('#loading').css('visibility','hidden');
        switch(distance){
            case 'feet':
                distTemp = parseFloat( data.routes.features[0].attributes.Total_Distance.toFixed(2) ).toFixed(2);
                dist = parseFloat(distTemp*5280).toFixed(2)
                distMsg = 'Feet';
                break;
            case 'miles':
                dist = parseFloat( data.routes.features[0].attributes.Total_Distance.toFixed(2) ).toFixed(2);
                distMsg = 'Miles';
                break;
            default:
                dist = parseFloat( data.routes.features[0].attributes.Total_Distance.toFixed(2) ).toFixed(2);
                distMsg = 'Miles';
                break;
        }
        switch(closestType){
            case 'ClosestFireStation':
                typeMsg = 'Fire Station';
                break;
            case 'ClosestHydrant':
                typeMsg = 'Fire Hydrant';
                break;
            default:
                typeMsg = 'Fire Station';
                break;
        };
        
        clMsg='<strong>&nbsp;Is Closest to&nbsp;</strong>'
        destMsg = data.routes.features[0].attributes.Name.replace('Location 1 - ','');
        
        $('#results').append(clMsg);
        $('#results').append('<span class="text-danger"><strong>'+typeMsg+' '+destMsg+'&nbsp;</strong></span>'+
                             '<span class="text-warning"><strong>('+dist+'&nbsp;'+distMsg+')</strong></span>');
        
           
        drawRoute(data)
    }
    function onEachFeature() {
      var popupContent = "<p>test!</p>";
      layer.bindPopup(popupContent);
    }
	 