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

var lm = {
	// The currently selected concept (shown in the main form)
	selectedResourceURI : null
};

/**
 * Open the JSP pages for IES Administration
 */
lm.openAdministrationPage = function() {
	lm.openPage('admin/');
};

/**
 * Open a page on server
 */
lm.openPage = function(relativeURL) {
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
lm.navigateTo = function(resourceURI, queryGraphURI) {
	window.location = swa.servlet + '?_base=' + escape(queryGraphURI) + 
		'&_resource=' + escape(resourceURI);
};


/**
 * Opens a new tab or browser window with the URL of the uispin servlet
 * with the default view of a given resource and a given context graph
 * @param resourceURI  the URI of the resource to navigate to
 * @param queryGraphURI  the URI of the current query graph
 */
lm.navigateToInTab = function(resourceURI, queryGraphURI, targetName) {
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
lm.execSPARQLMotion = function(script, params) {
    var results;
	params['id'] = script;
	params['_base'] = swa.queryGraphURI;
	$.ajax({
	 url: 'sparqlmotion', 
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
 * Clears all checkboxes within an element structure
 * @param pId  the ID of the parent element
 */
lm.clearSelection = function() {
	var ontologiesTab = 2 ;
	
	$('#TBL_Ontology-Schemas input[type=checkbox]').attr('checked',false) ;
	$("#ies-ontology-selections").hide();
	$("#ies-ontology-validation-results").hide();
	$("#ies_tabs").tabs("select",ontologiesTab); 
};

/**
 * Select all checkboxes within an element structure
 * @param pId  the ID of the parent element
 */
lm.selectAll = function() {
	$('#TBL_Ontology-Schemas input[type=checkbox]').attr('checked',true) ;
	 $("#ies-ontology-selections").hide();
};


/**
 * Initializes IES
 */
lm.init = function() {
	$("#ies-project-ontologies").empty();
    $("#xsd_generation_configuration").empty();
    $("#ies-generated-xsds").empty();
	};


/**
 * Accepts selected radio button for ontology project selection
 * @param pId  the ID of the parent element
 */
lm.setProject = function(rbgId) {
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
	
	lm.showXSDGenerationConfigurationDetails();
	
	}
	else { alert('No Project Selected')};   
};

/**
 * Show all ontologies in project
 * @param project - name of project
 */
lm.showAllGraphsInProject = function(project) {
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
	
	var onClickAction = 'lm.hideAllGraphsInProject("' + project + '");';
	$('#ies-all-graphs-button').attr('onclick', onClickAction);
	$("#ies-all-graphs-button").html('Hide All Graphs').button('refresh');	
	}
	else { alert('No Project Selected')};   
};

/**
 * Hide all ontologies in project
 * @param project - name of project
 */
lm.hideAllGraphsInProject = function(project) {

	$("#ies-all-ontology-graphs").empty();
	$("#ies-all-ontology-graphs").show();
	
	var onClickAction = 'lm.showAllGraphsInProject("' + project + '");';
	$('#ies-all-graphs-button').attr('onclick', onClickAction);
	$("#ies-all-graphs-button").html('Show All Graphs').button('refresh');	
	  
};

/**
* Build configuration blind for the project
*
*/
lm.showXSDGenerationConfigurationDetails = function() {
	var params = '&_viewClass=iess:BuildXSDGenerationConfigurationTab&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
	  $("#xsd_generation_configuration").empty();
	  $("#xsd_generation_configuration").append(data);
	  $("#xsd_generation_configuration").show();
	}) 
};

/**
 * Accepts selection of ontologies
 * @param pId  the ID of the parent element
 */
lm.acceptSelection = function(pId) {
     var resultList = '' ;
     var checkedRows =  $('#TBL_Ontology-Schemas input:checked');

// checkboxes have the prefix 'CB_'. This is removed before doing the 'TD-ONT_' prefix
     
     checkedRows.each(function(){
        var selection = $('#TD-ONT_' + this.name.substr(3,this.name.length)).parent().index().toString();
        resultList = (resultList=='')? selection : resultList + ',' + selection;
        });
	 lm.sendSelectedOntologies(resultList);
};

/**
 * Continue to pre-generation ontology validation
 */
lm.continueToOntologyValidation = function() {
	var xsdValidationTab = 3 ;

    $("#ies_tabs").tabs("select",xsdValidationTab); 
    lm.updateJob();
    lm.showXSDGenerationOntologyValidationResults();

};

/**
 * Continue to generation of XSD Schemas step - redundant
 */
lm.continueToGenerateXSDs = function() {
	var xsdValidationTab = 3 ;
	
	$("#ies-download-xsd-div").hide();
	$("#ies-download-xsd-lib").hide();
    $("#ies_tabs").tabs("select",xsdValidationTab); 
    lm.updateJob();
    lm.showSelectedOntologies();
    lm.showXSDGenerationOntologyValidationResults();

};

/**
* Update Session and Job details
*
*/
lm.updateJob = function() {
	var params = '&_viewClass=iess:UpdateJob&_snippet=true';
	
	$.get(swa.servlet, params, function(data) {
	}) 
};


/**
 * Create ZIP of XSDs
 *
 */
lm.createZIPofXSDs = function(param) {
    var id = 'ies-download-xsd-div' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildGeneratedXSDsTab&_snippet=true';
    
	swa.insertLoadingIndicator(e);
    e.show();
	
// call a SM script:

    var results = lm.execSPARQLMotion('iessm:zipXSDFiles',{});
    console.log(results);
    lm.buildDownloadRegionForXSDSchemas() ;   
	  };

/**
 * Create ZIP of XSD Lib
 *
 */
lm.createZIPofXSDLib = function(param) {
    var id = 'ies-download-xsd-lib' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildDownloadXSD-LibDiv&_snippet=true';
    
    swa.insertLoadingIndicator(e);
    e.show();
	
// call a SM script:

    var results = lm.execSPARQLMotion('iessm:zipXSDLibraryFiles',{});
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
lm.buildDownloadRegionForXSDSchemas = function() {
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
lm.generateXSDs = function(param) {
    var id = 'ies-busy-with-xsd-generation' ;
    var e = $('#' + id);
	var params = '&_viewClass=iess:BuildGeneratedXSDsTab&_snippet=true';
	var xmlSchemasTab = 4 ;
	
     swa.insertLoadingIndicator(e);
     e.show();
	
// call a SM script:

    var results = lm.execSPARQLMotion('iessm:generateXSDs',{});
    console.log(results);
    
    e.empty();
    e.show();

// now update the XML Schemas Generated Tab

      lm.showXSDGenerationDetails() ;
      
	  $("#ies_tabs").tabs("select",xmlSchemasTab);
	  };

/**
* Show Generated XSD files
*
*/
lm.showXSDGenerationDetails = function() {
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
lm.showSelectedOntologies = function() {
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
lm.showXSDGenerationOntologyValidationResults = function() {
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
lm.sendSelectedOntologies = function(ontologies) {
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
lm.navigateToHelp = function(tag) {
    var helpTab = 8 ;
    
    $("#ies_tabs").tabs("select",helpTab);   
    location.hash = "#" + tag;
};


/**
 * Opens a dialog
 * @param data
 */
lm.openDialog = function(title, data, width) {

/* clone image and change the width of the figure to 'width' */ 

    var myData = $(data).clone().attr('width', width) ;
    
    myData = $(myData).removeAttr('height') ; 
    
	var win = $("<div></div>").css({height:"900px", overflow:"auto"})
	
	$(win).append(myData);
 
	lm.dialog = $(win).dialog({
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
lm.openHelperDialog = function(title, data) {
    swa.load('ies-dialog-div', data) ;
	lm.openModalDialog('ies-dialog-div',title, 600, 160,{});
};

/**
 * Opens a floating window dialog
 */
lm.openModalDialog = function(loadId, title, width, height, buttons) {
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
lm.showResourceInMainForm = function(resourceURI) {
	if(lm.selectedResourceURI != resourceURI) {
		lm.reloadForm(resourceURI);
		lm.recordSelectedResource(resourceURI);
	}
}

/**
 * Changes the selected resource in the center form.
 * Also remembers the entry in the navigation history.
 * @param resourceURI  the URI of the resource 
 */
lm.setSelectedResourceFromTree = function(resourceURI) {
	if(lm.selectedResourceURI != resourceURI) {
		lm.reloadForm(resourceURI);
		lm.recordSelectedResource(resourceURI);
	}
}

/**
 * Changes the selected resource in the center form and in the concept tree.
 * Also remembers the entry in the navigation history.
 * @param resourceURI  the URI of the resource 
 */
lm.setSelectedResource = function(resourceURI, editing) {
	if(lm.selectedResourceURI != resourceURI) {
		var params = {
			'resource' : '<' + resourceURI + '>'
		};
		if(editing) {
			params['editing'] = true;
		}
		lm.setViewModeName(params);
		swa.load('mainForm', params);
		swa.selectTreeNode('mainTree', resourceURI, swa.queryGraphURI);
		lm.recordSelectedResource(resourceURI);
	}
}

// Private: helper function that sets the viewModeName depending on history box 
lm.setViewModeName = function(params) { 
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
lm.recordSelectedResource = function(resourceURI) {
	lm.selectedResourceURI = resourceURI;
	window.location.hash = '#' + encodeURIComponent(resourceURI);
}

lm.reloadForm = function(resourceURI) {
	if(!resourceURI) {
		resourceURI = lm.selectedResourceURI;
		if(!resourceURI) {
			return;
		}
	}
	var params = {
			'resource' : '<' + resourceURI + '>',
	};
	lm.setViewModeName(params);
	swa.load('mainForm', params);
};

/**
 * Called when the roots of the tree have been loaded.
 * Will make sure that the node behind the # gets selected
 * and if no hash section exists, opens all tree roots.
 */
lm.onTreeLoaded = function() {
	lm.updateSelectedResource();
	if(!lm.selectedResourceURI) {
		swa.openTreeRoots('mainTree');
	}
};

lm.updateSelectedResource = function() {
    lm.hash = window.location.hash;
    if(lm.hash.length > 1) {
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
    	if(lm.selectedResourceURI != resourceURI) {
    		lm.selectedResourceURI = resourceURI;
    		lm.reloadForm(resourceURI);
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
lm.viewOntology = function(baseURI, targetName) {
	window.open(swa.servlet + '?_viewClass=iess:OntologyBrowserPage&ontology=' + escape(baseURI), targetName);
};

// $('#TBL_Ontology-Schemas input:checked').each(function(){alert('TD-ONT_' + this.name.substr(3,this.name.length))})