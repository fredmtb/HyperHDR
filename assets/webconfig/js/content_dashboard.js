$(document).ready( function() {
	performTranslation();

// 	function newsCont(t,e,l)
// 	{
// 		var h = '<div style="padding-left:9px;border-left:6px solid #0088cc;">';
// 		h += '<h4 style="font-weight:bold;font-size:17px">'+t+'</h4>';
// 		h += e;
// 		h += '<a href="'+l+'" class="" target="_blank"><i class="fa fa-fw fa-newspaper-o"></i>'+$.i18n('dashboard_newsbox_readmore')+'</a>';
// 		h += '</div><hr/>';
// 		$('#dash_news').append(h);
// 	}

// 	function createNews(d)
// 	{
// 		for(var i = 0; i<d.length; i++)
// 		{
// 			if(i > 5)
// 				break;
//
// 			var title = d[i].title.rendered;
// 			var excerpt = d[i].excerpt.rendered;
// 			var link = d[i].link+'?pk_campaign=WebUI&pk_kwd=news_'+d[i].slug;
//
// 			newsCont(title,excerpt,link);
// 		}
// 	}

// 	function getNews()
// 	{
// 		var h = '<span style="color:red;font-weight:bold">'+$.i18n('dashboard_newsbox_noconn')+'</span>';
// 		$.ajax({
// 			url: 'https://hyperion-project.org/wp-json/wp/v2/posts?_embed',
// 			dataType: 'json',
// 			type: 'GET',
// 			timeout: 2000
// 		})
// 		.done( function( data, textStatus, jqXHR ) {
// 			if(jqXHR.status == 200)
// 				createNews(data);
// 			else
// 				$('#dash_news').html(h);
// 		})
// 		.fail( function( jqXHR, textStatus ) {
// 				$('#dash_news').html(h);
// 		});
// 	}

//	getNews();

	function updateComponents()
	{
		var components = window.comps;
		var components_html = "";
		for (var idx=0; idx<components.length;idx++)
		{
			if(components[idx].name != "ALL" && components[idx].name != "GRABBER")
				components_html += '<tr><td>'+$.i18n('general_comp_'+components[idx].name)+'</td><td><i class="fa fa-circle component-'+(components[idx].enabled?"on":"off")+'"></i></td></tr>';
		}
		$("#tab_components").html(components_html);

		//info
		var hyperion_enabled = true;

		components.forEach( function(obj) {
			if (obj.name == "ALL")
			{
				hyperion_enabled = obj.enabled
			}
		});

		var instancename = window.currentHyperionInstanceName;

		$('#dash_statush').html(hyperion_enabled ? '<span style="color:green">'+$.i18n('general_btn_on')+'</span>' : '<span style="color:red">'+$.i18n('general_btn_off')+'</span>');
		$('#btn_hsc').html(hyperion_enabled ? '<button class="btn btn-sm btn-danger" onClick="requestSetComponentState(\'ALL\',false)">'+$.i18n('dashboard_infobox_label_disableh', instancename)+'</button>' : '<button class="btn btn-sm btn-success" onClick="requestSetComponentState(\'ALL\',true)">'+$.i18n('dashboard_infobox_label_enableh', instancename)+'</button>');
	}

	// add more info
	$('#dash_leddevice').html(window.serverConfig.device.type);
	$('#dash_currv').html(window.currentVersion);
	$('#dash_instance').html(window.currentHyperionInstanceName);
	$('#dash_ports').html(window.serverConfig.flatbufServer.port+' | '+window.serverConfig.protoServer.port);
	$('#dash_watchedversionbranch').html(window.serverConfig.general.watchedVersionBranch);

	getReleases(function(callback){
		if(callback)
		{
			$('#dash_latev').html(window.latestVersion.tag_name);

			if (semverLite.gt(window.latestVersion.tag_name, window.currentVersion))
				$('#versioninforesult').html('<div class="bs-callout bs-callout-warning" style="margin:0px"><a target="_blank" href="' + window.latestVersion.html_url + '">'+$.i18n('dashboard_infobox_message_updatewarning', window.latestVersion.tag_name) + '</a></div>');
			else
				$('#versioninforesult').html('<div class="bs-callout bs-callout-success" style="margin:0px">'+$.i18n('dashboard_infobox_message_updatesuccess')+'</div>');

			}
	});



	//determine platform
	var html = "";
	
	if (window.serverInfo.grabbers != null && window.serverInfo.grabbers != undefined &&
	    window.serverInfo.grabbers.active != null && window.serverInfo.grabbers.active != undefined)
	{
		var grabbers = window.serverInfo.grabbers.active;
		if (grabbers.indexOf('V4L2:Media Foundation') > -1)
			html += 'Windows (Microsoft Media Foundation)';
		else if (grabbers.indexOf('V4L2:macOS AVF') > -1)
			html += 'macOS (AVF)';
		else if (grabbers.indexOf('V4L2') > -1)
			html += 'Linux (V4L2)';		
		else
			html += 'Unknown';
	}
	else
	{
		html = 'None';
	}

	$('#dash_platform').html(html);


	//interval update
	updateComponents();
	$(window.hyperion).on("components-updated",updateComponents);

	if(window.showOptHelp)
		createHintH("intro", $.i18n('dashboard_label_intro'), "dash_intro");

	removeOverlay();
});
