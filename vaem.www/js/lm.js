/**
 * The JavaScript library for the LM components.
 * 
 * filename: lm.js
 * last modified: Sep 24, 2016
 * editor; Ralph Hodgson
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
 * Opens an SWP generated page in a new window
 * @param params
 * @title window title
 */
lm.openSWP = function(script,params,title) { 
	  var results;
	  results=lm.execSWP(script,params );	  	  
	  var w = window.open("","_graph");
	  
	  w.document.open();
	  w.document.write(results);
	  w.document.title= title;
	  w.document.close();  
};

/**
 * Executes an SWP script on the server.
 * The script must be globally registered (using an .sms. file).
 * @param script  the qname of the script
 * @param params  the parameters
 * @param callback  a JavaScript expression that shall be executed when the script
 *                  finishes.  Can access the result of the script with the variable 'data'.
 */
lm.execSWP = function(script, params) {
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
 * Generate content for popups showing a resource summary
 * @param formId  the id of the search form
 */
lm.popupResourceSummary = function(loadId) { 
     var buttons = [{
         text: "Access Details on TopBraid Server",
         click: function() {
          alert('Call to TopBraid Server to be implemented later ...')
         }
       },
       {
        text: "Close",
        click: function() {
           $( this ).dialog( "close" );
            }
        }
       ];
	 lm.openModalDialog(loadId,"", 800,800,buttons)		  
};

/**
 * Generate content for popups 
 * @param formId  the id of the search form
 */
lm.popup = function(loadId, title, width, height) {
     var buttons = [{
         text: "Access more on TopBraid Server",
         click: function() {
          alert('Call to TopBraid Server to be implemented later ...')
         }
       },
       {
        text: "Close",
        click: function() {
           $( this ).dialog( "close" );
            }
        }
       ];
	 lm.openModalDialog(loadId,title,width,height,buttons)		  
};

/**
 * Clears all checkboxes within an element structure
 * @param pId  the ID of the parent element
 */
lm.clearSelection = function() {
	$('.sliderCheckbox input').attr('checked',false) ;
};

/**
 * Select all checkboxes within an element structure
 * @param pId  the ID of the parent element
 */
lm.selectAll = function() {
	$('.sliderCheckbox input').attr('checked',true) ;
};

/**
 * Accepts selection 
 * @param resource
 */
lm.acceptSelection = function(tableId, graph, overlay) {
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
         
         lm.execSWP('lmdoc:CreateHTMLforResource',params);
        });
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
 * Generates resource view in new tab 
 * @param resource
 */
lm.generate = function(uri,graph, view, overlay) { 
	  var results;
	  var params='&resource='+ uri + "&graph=" + graph + "&overlay=" + overlay ; 
	  results=lm.execSWP(view,params );
	  var w = window.open("","_blank");
	  
	  w.document.open();
	  w.document.write(results);
	  w.document.title= uri;
	  w.document.close();	  	  
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
	var theContent = $('#'+loadId) ;
	var options = {
			modal: false,
			title: title,
			resizeable: true,
			draggable: true
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
	theContent.dialog(options);
};


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

/**
 * Opens a window for sending mail
 */

lm.mailto=
	  function ( name, domain, subject, body ) {
	    var url='mailto:'+encodeURIComponent(name+'@'+domain);
	    if (subject!='') url+='?subject='+encodeURIComponent(subject);
	    if (body!='') url+=(subject=='' ? '?' : '&')+'body='+encodeURIComponent(body);
	    window.location.href=url;
	  };

// ends