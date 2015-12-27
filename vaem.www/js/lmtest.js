/**
 * The JavaScript library for the LM components.
 * 
 * Note that this is under active development and some parts of this API
 * are more stable than others.
 * 
 * The public API that is considered relatively safe can be found on the top
 * of this file - anything under the demarkation line should only be used at
 * your own risk.  Please contact the developers if you need some specific
 * feature promoted to the stable API, or if you find a bug or limitation.
 */

var ctx = "${pageContext.request.contextPath}"

var lmtest = {
	// The currently selected concept (shown in the main form)
	selectedResourceURI : null
};



/**
 * Open a page on server
 */
lmtest.openPage = function(relativeURL) {
   var base = document.getElementsByTagName('base')[0];
    if (base && base.href && (base.href.length > 0)) {
        base = base.href;
    } else {
        base = document.URL;
    };
    if (base.indexOf("/swp") > -1) {
        base = base.substr(0,base.indexOf("/swp"));
    } if (base.lastIndexOf("/") != (base.length - 1)) {
    	base += "/";
    }
    page = base + relativeURL ;
	window.open(page, '_blank');
};

/**
 * Changes the location (URL) of the current browser window to the
 * URL of the uispin servlet with the default view of a given resource
 * and a given context graph
 * @param resourceURI  the URI of the resource to navigate to
 * @param queryGraphURI  the URI of the current query graph
 * @return false
 */
lmtest.navigateTo = function(resourceURI, queryGraphURI) {
	window.location = swa.servlet + '?_base=' + escape(queryGraphURI) + 
		'&_resource=' + escape(resourceURI);
};


/**
 * Opens a new tab or browser window with the URL of the uispin servlet
 * with the default view of a given resource and a given context graph
 * @param resourceURI  the URI of the resource to navigate to
 * @param queryGraphURI  the URI of the current query graph
 */
lmtest.navigateToInTab = function(resourceURI, queryGraphURI, targetName) {
	window.open(swa.servlet + '?_base=' + escape(queryGraphURI) + 
		'&_resource=' + escape(resourceURI), targetName);
};


/**
 * Executes a SPARQLMotion script on the server.
 * The script must be globally registered (using an .sms. file).
 * @param script  the qname of the script
 * @param params  the parameters
 * @param callback  a JavaScript expression that shall be executed when the script
 *                  finishes.  Can access the result of the script with the variable 'data'.
 */
lmtest.execSPARQLMotion = function(script, params) {
    var results;
    
//    params['id'] = script;
	
//	params['_base'] = swa.queryGraphURI;
	
	$.ajax({
	 url: 'sparqlmotion', 
	 type: 'get' ,
	 data: 'id=' + script + params,
	 async: false,
	 success: function(data) {
	   results = data ;
	   }
	});
	return(results);
};

/**
 * Executes an SWP script on the server.
 * The script must be globally registered (using an .sms. file).
 * @param script  the qname of the script
 * @param params  the parameters
 * @param callback  a JavaScript expression that shall be executed when the script
 *                  finishes.  Can access the result of the script with the variable 'data'.
 */
lmtest.execSWP = function(script, params) {
	var params = '_viewClass=' + script + params
	var results;
    
	$.ajax({
	 url: 'swp', 
	 type: 'get' ,
	 data: params,
	 async: false,
	 success: function(data) {
	   results = data ;
	   }
	});
	return(results);
};

/**
 * Opens an SWP generated page in a new window
 * @param params
 * @title window title
 */
lmtest.openSWP = function(script,params,title) { 
	  var results;
	  results=lmtest.execSWP(script,params );	  	  
	  var w = window.open("","_graph");
	  
	  w.document.open();
	  w.document.write(results);
	  w.document.title= title;
	  w.document.close();  
};


/**
 * Clears all checkboxes within an element structure
 * @param pId  the ID of the parent element
 */
lmtest.clearSelection = function() {
	var ontologiesTab = 2 ;
	
	$('#lm_resources input[type=checkbox]').attr('checked',false) ;
//	$("#ies-ontology-selections").hide();
//	$("#ies-ontology-validation-results").hide();
//	$("#ies_tabs").tabs("select",ontologiesTab); 
};

/**
 * Select all checkboxes within an element structure
 * @param pId  the ID of the parent element
 */
lmtest.selectAll = function() {
	$('#lm_resources input[type=checkbox]').attr('checked',true) ;
//	 $("#ies-ontology-selections").hide();
};

/**
 * Accepts selection 
 * @param resource
 */
lmtest.acceptSelection = function(tableId, graph, overlay) {
     var resultList = '' ;
     var checkedRows =  $('.lm-row input:checked'); 
     
     checkedRows.each(function(){
        var elementId ='#td-resource_' + this.name.substr(3,this.name.length),
            selection = $(elementId).html();
         resultList = (resultList=='')? selection : resultList + ',' + selection;
         console.log ('Generating ' + selection);
         var params="&swpElement=http%3A%2F%2Fwww.linkedmodel.org%2Foui%2Flmdoc%23Instance" ;
         
         params = params + "&graph=" + escape(graph) ;
         params = params + "&resource=" + escape(selection);
         params = params + "&overlay=" + escape(overlay);
         
         lmtest.execSPARQLMotion('createHTMLdocumentForResource',params);
         
// http://localhost:8083/tbl/sparqlmotion?id=createHTMLdocumentForResource&swpElement=http%3A%2F%2Fwww.linkedmodel.org%2Foui%2Flmdoc%23Instance&graph=http://www.linkedmodel.org/2.0/schema/vaem&resource=http%3A%2F%2Fwww.linkedmodel.org%2Fschema%2Fvaem%23SchemaGraph
        });

};

/**
 * Accepts selection 
 * @param resource
 */
lmtest.generate = function(uri,graph,overlay) { 
	  var results;
	  var params='&resource='+ uri + "&graph=" + graph + "&overlay=" + overlay;  
	  
	  results=lmtest.execSWP('lmdoc:Instance',params );	  
	  
	  var w = window.open("","_resource");
	  
	  w.document.open();
	  w.document.write(results);
	  w.document.title= uri;
	  w.document.close();
	  
	  console.log(params);


//	  $(w).load("/" + "?_viewClass=" + params);
	 
//	  lmtest.openDialog("Instance", results, "1000px")
	  
//		var win = $("<div></div>").css({height:"400px"}) ;
		
//	    $(win).html(data);	 
//		lmtest.dialog = $(win).dialog({
 //      'modal' : true,
//	        'title' : title,
//	        'resizable' : false,
//	        'width': "900px",
//	        'buttons': {}       
//	    });
		
	  
};


/**
 * Initialize
 */
lmtest.init = function() {
	$("#ies-project-ontologies").empty();
    $("#xsd_generation_configuration").empty();
    $("#ies-generated-xsds").empty();
	};


/**
 * Accepts selected radio button for ontology project selection
 * @param pId  the ID of the parent element
 */
lmtest.setProject = function(rbgId) {
    var result = $('input[name=' + rbgId + ']:checked').val()
	var params = '';
	var escaped = '&project=' + result;
	var ontologiesTab = 2 ;
	params += '&_viewClass=iess:BuildOntologySelectionsTable&_snippet=true' + escaped;
	if (result != null){

// show project ontologies
	
	$.get(swa.servlet, params, function(data) {
	  $("#ies-project-ontologies").empty();
	  $("#ies-project-ontologies").append(data);
	  $("#ies-project-ontologies").show();
	  $("#ies-ontology-validation-results").hide();
	  $("#ies-download-xsd-div").hide();
	  $("#ies-all-ontology-graphs").hide();
	  $("#ies-download-xsd-lib").hide();
	  $("#ies-all-graphs-button").html('Show All Graphs').button('refresh');
      $("#ies_tabs").tabs("select",ontologiesTab); 
	})
	
	lmtest.showXSDGenerationConfigurationDetails();
	
	}
	else { alert('No Project Selected')};   
};

/**
 * Show all ontologies in project
 * @param project - name of project
 */
lmtest.showAllGraphsInProject = function(project) {
    var id = 'ies-all-ontology-graphs'
    var e = $('#' + id);
	var params = '';
	var escaped = '&project=' + project;
	params += '&_viewClass=iess:BuildOntoloiesInProjectTable&_snippet=true' + escaped;
	if (project != null){

// show all ontologies in project

     swa.insertLoadingIndicator(e);
     e.show();

	$.get(swa.servlet, params, function(data) {
	  $("#ies-all-ontology-graphs").empty();
	  $("#ies-all-ontology-graphs").append(data);
	  $("#ies-all-ontology-graphs").show(); 
	}) ;
	
	var onClickAction = 'lmtest.hideAllGraphsInProject("' + project + '");';
	$('#ies-all-graphs-button').attr('onclick', onClickAction);
	$("#ies-all-graphs-button").html('Hide All Graphs').button('refresh');	
	}
	else { alert('No Project Selected')};   
};

/**
 * Hide all ontologies in project
 * @param project - name of project
 */
lmtest.hideAllGraphsInProject = function(project) {

	$("#ies-all-ontology-graphs").empty();
	$("#ies-all-ontology-graphs").show();
	
	var onClickAction = 'lmtest.showAllGraphsInProject("' + project + '");';
	$('#ies-all-graphs-button').attr('onclick', onClickAction);
	$("#ies-all-graphs-button").html('Show All Graphs').button('refresh');	
	  
};

/**
* Build configuration blind for the project
*
*/
lmtest.showXSDGenerationConfigurationDetails = function() {
	var params = '&_viewClass=iess:BuildXSDGenerationConfigurationTab&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
	  $("#xsd_generation_configuration").empty();
	  $("#xsd_generation_configuration").append(data);
	  $("#xsd_generation_configuration").show();
	}) 
};


/**
 * Continue to pre-generation ontology validation
 */
lmtest.continueToOntologyValidation = function() {
	var xsdValidationTab = 3 ;

    $("#ies_tabs").tabs("select",xsdValidationTab); 
    lmtest.updateJob();
    lmtest.showXSDGenerationOntologyValidationResults();

};

/**
 * Continue to generation of XSD Schemas step - redundant
 */
lmtest.continueToGenerateXSDs = function() {
	var xsdValidationTab = 3 ;
	
	$("#ies-download-xsd-div").hide();
	$("#ies-download-xsd-lib").hide();
    $("#ies_tabs").tabs("select",xsdValidationTab); 
    lmtest.updateJob();
    lmtest.showSelectedOntologies();
    lmtest.showXSDGenerationOntologyValidationResults();

};

/**
* Update Session and Job details
*
*/
lmtest.updateJob = function() {
	var params = '&_viewClass=iess:UpdateJob&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
	}) 
};


/**
 * Create ZIP of XSDs
 *
 */
lmtest.createZIPofXSDs = function(param) {
    var id = 'ies-download-xsd-div' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildGeneratedXSDsTab&_snippet=true';
    
	swa.insertLoadingIndicator(e);
    e.show();
	
// call a SM script:

    var results = lmtest.execSPARQLMotion('iessm:zipXSDFiles',{});
    console.log(results);
    lmtest.buildDownloadRegionForXSDSchemas() ;   
	  };

/**
 * Create ZIP of XSD Lib
 *
 */
lmtest.createZIPofXSDLib = function(param) {
    var id = 'ies-download-xsd-lib' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildDownloadXSD-LibDiv&_snippet=true';
    
    swa.insertLoadingIndicator(e);
    e.show();
	
// call a SM script:

    var results = lmtest.execSPARQLMotion('iessm:zipXSDLibraryFiles',{});
    console.log(results);
	$.get(swa.servlet, params, function(data) {
	$("#ies-download-xsd-lib").empty();
	$("#ies-download-xsd-lib").append(data);    
    $("#ies-download-xsd-lib").show();
	})    
	  };


/**
* Build download button for XSD Schemas
*
*/
lmtest.buildDownloadRegionForXSDSchemas = function() {
	var params = '&_viewClass=iess:BuildDownloadXSD-SchemasDiv&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
	$("#ies-download-xsd-div").empty();
	$("#ies-download-xsd-div").append(data);    
    $("#ies-download-xsd-div").show();
	}) 
};

/**
 * Generate XSDs
 *
 */
lmtest.generateXSDs = function(param) {
    var id = 'ies-busy-with-xsd-generation' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildGeneratedXSDsTab&_snippet=true';
	var xmlSchemasTab = 4 ;
	
     swa.insertLoadingIndicator(e);
     e.show();
	
// call a SM script:

    var results = lmtest.execSPARQLMotion('iessm:generateXSDs',{});
    console.log(results);
    
    e.empty();
    e.show();

// now update the XML Schemas Generated Tab

      lmtest.showXSDGenerationDetails() ;
      
	  $("#ies_tabs").tabs("select",xmlSchemasTab);
	  };

/**
* Show Generated XSD files
*
*/
lmtest.showXSDGenerationDetails = function() {
	var params = '&_viewClass=iess:BuildGeneratedXSDsTab&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
 	  $("#ies-generated-xsds").empty();
	  $("#ies-generated-xsds").append(data);
	  $("#ies-generated-xsds").show();
	}) 
};

/**
* Show Selected Ontologies of the Project
*
*/
lmtest.showSelectedOntologies = function() {
	var params = '&_viewClass=iess:BuildXSDGenerationSelectedOntologiesBlind&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
	  $("#xsd_generation_selected_ontologies").empty();
	  $("#xsd_generation_selected_ontologies").append(data);
	  $("#xsd_generation_selected_ontologies").show();
	}) 
};

/**
* Build Ontology Validation for the project
*
*/
lmtest.showXSDGenerationOntologyValidationResults = function() {
    var id = 'ies-ontology-validation-results' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildXSDGenerationOntologyValidationTab&_snippet=true';

    swa.insertLoadingIndicator(e);
    e.show();
	
	$.get(swa.servlet, params, function(data) {
	  e.empty();
	  e.append(data);
	  e.show();
	}) 
};

/**
 * Get resources corresponding to checked boxes for a given id. 
 * @param formId  the form id
 * @param targetId  the target id
 * @param onSelect  the value for onSelect of the generated grid 
 */
lmtest.sendSelectedOntologies = function(ontologies) {
	var params = '';
	var escaped = '&ontologyList=' + escape(ontologies);
    var validationTab = 3 ;
    
	params += '&_viewClass=iess:ConfirmSelectedOntologies&_snippet=true' + escaped;
	$.get(swa.servlet, params, function(data) {
	  $("#ies-ontology-selections").empty();
	  $("#ies-ontology-selections").append(data);
	  $("#ies-ontology-selections").show();
	  $("#ies_tabs").tabs("select",validationTab);
	});
};

/*
*
*/
lmtest.navigateToHelp = function(tag) {
    var helpTab = 8 ;
    
    $("#ies_tabs").tabs("select",helpTab);   
    location.hash = "#" + tag;
};

/**
 * Opens a dialog
 * @param data
 */
lmtest.openDialog = function(title, data, width) {
	var win = $("<div></div>").css({height:"400px"}) ;
	
//    $(win).html(data);
 
	lmtest.dialog = $(win).dialog({
        'modal' : true,
        'title' : title,
        'resizable' : false,
        'width': width,
        'buttons': {}       
    });
	
	

};

/**
 * Uses ui:loadable to display swp-generated content
 */
lmtest.openHelperDialog = function(title, data) {
    swa.load('ies-dialog-div', data) ;
	lmtest.openModalDialog('ies-dialog-div',title, 600, 160,{});
};

/**
 * Opens a floating window dialog
 */
lmtest.openModalDialog = function(loadId, title, width, height, buttons) {
	var div = $('#' + loadId);
	var options = {
			modal: true,
			title: title
		};
	if(buttons) {
		options.buttons = buttons;
	}
	if(width) {
		options.width = width;
	}
	if(height) {
		options.height = height;
	}
	div.dialog(options);
}

/**
 * Changes the selected resource in the center form.
 * Also remembers the entry in the navigation history.
 * @param resourceURI  the URI of the resource 
 */
lmtest.showResourceInMainForm = function(resourceURI) {
	if(lmtest.selectedResourceURI != resourceURI) {
		lmtest.reloadForm(resourceURI);
		lmtest.recordSelectedResource(resourceURI);
	}
}

/**
 * Changes the selected resource in the center form.
 * Also remembers the entry in the navigation history.
 * @param resourceURI  the URI of the resource 
 */
lmtest.setSelectedResourceFromTree = function(resourceURI) {
	if(lmtest.selectedResourceURI != resourceURI) {
		lmtest.reloadForm(resourceURI);
		lmtest.recordSelectedResource(resourceURI);
	}
}

/**
 * Changes the selected resource in the center form and in the concept tree.
 * Also remembers the entry in the navigation history.
 * @param resourceURI  the URI of the resource 
 */
lmtest.setSelectedResource = function(resourceURI, editing) {
	if(lmtest.selectedResourceURI != resourceURI) {
		var params = {
			'resource' : '<' + resourceURI + '>'
		};
		if(editing) {
			params['editing'] = true;
		}
		lmtest.setViewModeName(params);
		swa.load('mainForm', params);
		swa.selectTreeNode('mainTree', resourceURI, swa.queryGraphURI);
		lmtest.recordSelectedResource(resourceURI);
	}
}

// Private: helper function that sets the viewModeName depending on history box 
lmtest.setViewModeName = function(params) { 
	var historyModeBox = $('#historyModeBox');
	var val = historyModeBox.attr('checked');
	if(val == 'checked') {
		params['viewModeName'] = '\"history\"';
	}
	else {
		params['viewModeName'] = '\"view\"';
	}
};

/**
 * Sets the hash part of the current document location, so that back and
 * forward buttons work.
 * @param resourceURI  the URI of the resource 
 */
lmtest.recordSelectedResource = function(resourceURI) {
	lmtest.selectedResourceURI = resourceURI;
	window.location.hash = '#' + encodeURIComponent(resourceURI);
}

lmtest.reloadForm = function(resourceURI) {
	if(!resourceURI) {
		resourceURI = lmtest.selectedResourceURI;
		if(!resourceURI) {
			return;
		}
	}
	var params = {
			'resource' : '<' + resourceURI + '>',
	};
	lmtest.setViewModeName(params);
	swa.load('mainForm', params);
};

/**
 * Called when the roots of the tree have been loaded.
 * Will make sure that the node behind the # gets selected
 * and if no hash section exists, opens all tree roots.
 */
lmtest.onTreeLoaded = function() {
	lmtest.updateSelectedResource();
	if(!lmtest.selectedResourceURI) {
		swa.openTreeRoots('mainTree');
	}
};

lmtest.updateSelectedResource = function() {
    lmtest.hash = window.location.hash;
    if(lmtest.hash.length > 1) {
    	// Work around Firefox bug: http://stackoverflow.com/questions/1703552/encoding-of-window-location-hash
    	var href = window.location.href;
    	var hashIndex = href.indexOf('#');
    	var rawHash = hashIndex > 0 ? href.substring(hashIndex + 1) : href;
    	var resourceURI;
    	if(rawHash.indexOf(':') > 0) {
    		resourceURI = rawHash; // Already decoded (Firefox page reload)
    	}
    	else {
    		resourceURI = decodeURIComponent(rawHash);
    	}
    	if(lmtest.selectedResourceURI != resourceURI) {
    		lmtest.selectedResourceURI = resourceURI;
    		lmtest.reloadForm(resourceURI);
        	swa.selectTreeNode('mainTree', resourceURI, swa.queryGraphURI);
    	}
    }
};

/**
 * Opens a new tab or browser window for viewing an ontology
 * with  a given context graph
 * @param resourceURI  the URI of the ontology
 * @param targetName  the window to open
 */
lmtest.viewOntology = function(baseURI, targetName) {
	window.open(swa.servlet + '?_viewClass=iess:OntologyBrowserPage&ontology=' + escape(baseURI), targetName);
};

// $('#TBL_Ontology-Schemas input:checked').each(function(){alert('TD-ONT_' + this.name.substr(3,this.name.length))})