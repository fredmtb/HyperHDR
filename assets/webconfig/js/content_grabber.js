$(document).ready( function() {
  performTranslation();
  var conf_editor_v4l2 = null;  
  var V4L2_AVAIL = window.serverInfo.grabbers.available.includes("v4l2");

  if(V4L2_AVAIL) {
    // Dynamic v4l2 enum schema
    var v4l2_dynamic_enum_schema = {
		"available_devices":
			{
			"type": "string",
			"title": "edt_conf_v4l2_device_title",
			"propertyOrder" : 1,
			"required" : true
			},
		"device_inputs":
			{
			"type": "string",
			"title": "edt_conf_v4l2_input_title",
			"propertyOrder" : 3,
			"required" : true
			},
		"resolutions":
			{
			"type": "string",
			"title": "edt_conf_v4l2_resolution_title",
			"propertyOrder" : 6,
			"required" : true
			},
		"framerates":
			{
			"type": "string",
			"title": "edt_conf_v4l2_framerate_title",
			"propertyOrder" : 9,
			"required" : true
			},
		"videoCodecs":
			{
			"type": "string",
			"title": "edt_conf_v4l2_v4l2Encoding_title",
			"propertyOrder" : 11,
			"required" : true
			}
    };

    // Build dynamic v4l2 enum schema parts
    var buildSchemaPart = function(key, schema, device) {
		if (schema[key]) 
		{
			var enumVals = [];
			var enumTitelVals = [];
			var s = JSON.stringify(window.serverInfo.grabbers.v4l2_properties);

			if (s)
			{
				var v4l2_properties = JSON.parse(s);			
				
				if (key === 'available_devices')
				{				
					for (var i = 0; i < v4l2_properties.length; i++) {
						enumVals.push(v4l2_properties[i]['device']);

						v4l2_properties[i].hasOwnProperty('name')
						  ? enumTitelVals.push(v4l2_properties[i]['name'])
						  : enumTitelVals.push(v4l2_properties[i]['device']);
					}
				}
				else if (key == 'resolutions' || key == 'framerates' || key == 'videoCodecs')
				{
					for (var i = 0; i < v4l2_properties.length; i++) 
					{
						if (v4l2_properties[i]['device'] == device) {
							enumVals = enumTitelVals = v4l2_properties[i][key];
							break;
						}
					}
				}
				else if (key == 'device_inputs') 
				{
					for (var i = 0; i < v4l2_properties.length; i++)
					{
						if (v4l2_properties[i]['device'] == device) {
							for (var index = 0; index < v4l2_properties[i]['inputs'].length; index++)
							{
								enumVals.push(v4l2_properties[i]['inputs'][index]['inputIndex'].toString());
								enumTitelVals.push(v4l2_properties[i]['inputs'][index]['inputName']);
							}
							break;
						}
					}
				}

				window.schema.grabberV4L2.properties[key] = {
					"type": schema[key].type,
					"title": schema[key].title,
					"enum": [].concat(["auto"], enumVals),
					"options" :
					{
						"enum_titles" : [].concat(["edt_conf_enum_automatic"], enumTitelVals),
					},
					"propertyOrder" : schema[key].propertyOrder,
					"required" : schema[key].required
				};
			}
		}
    };
	
    // Switch between visible states
    function toggleOption(option, state) {
		$('[data-schemapath="root.grabberV4L2.'+option+'"]').toggle(state);
		if (state) (
			$('[data-schemapath="root.grabberV4L2.'+option+'"]').addClass('col-md-12'),
			$('label[for="root_grabberV4L2_'+option+'"]').css('left','10px'),
			$('[id="root_grabberV4L2_'+option+'"]').css('left','10px')
		);
    }

    // Watch all v4l2 dynamic fields
    var setWatchers = function(schema) {
		var path = 'root.grabberV4L2.';
		Object.keys(schema).forEach(function(key) {
			conf_editor_v4l2.watch(path + key, function() {
				var ed = conf_editor_v4l2.getEditor(path + key);
				var val = ed.getValue();

				if (key == 'available_devices')
				{
					var V4L2properties = ['device_inputs', 'resolutions', 'framerates', 'videoCodecs'];
					if (val == 'auto')
					{
						V4L2properties.forEach(function(item) {
						conf_editor_v4l2.getEditor(path + item).setValue('auto');
						conf_editor_v4l2.getEditor(path + item).disable();
						});

						toggleOption('device', false);
						toggleOption('input', false);
						toggleOption('width', false);
						toggleOption('height', false);
						toggleOption('fps', false);
						toggleOption('v4l2Encoding', false);

					}
					else 
					{
						var grabberV4L2 = ed.parent;
						V4L2properties.forEach(function(item) {
							buildSchemaPart(item, v4l2_dynamic_enum_schema, val);
							grabberV4L2.original_schema.properties[item] = window.schema.grabberV4L2.properties[item];
							grabberV4L2.schema.properties[item] = window.schema.grabberV4L2.properties[item];
							conf_editor_v4l2.validator.schema.properties.grabberV4L2.properties[item] = window.schema.grabberV4L2.properties[item];

							grabberV4L2.removeObjectProperty(item);
							delete grabberV4L2.cached_editors[item];
							grabberV4L2.addObjectProperty(item);

							conf_editor_v4l2.getEditor(path + item).enable();
						});

						toggleOption('device', false);
					}
				}

          if (key == 'resolutions')
          {
              toggleOption('width', false);
			  toggleOption('height', false);
          }   

          if (key == 'framerates')
			  toggleOption('fps', false);
		  
		  if (key == 'videoCodecs')
			  toggleOption('v4l2Encoding', false);

          if (key == 'device_inputs')
			  toggleOption('input', false);
        });
      });
    };

    // Insert dynamic v4l2 enum schema parts
    Object.keys(v4l2_dynamic_enum_schema).forEach(function(key) {
      buildSchemaPart(key, v4l2_dynamic_enum_schema, window.serverConfig.grabberV4L2.device);
    });
  }

	if(window.showOptHelp) 
	{   
		if(V4L2_AVAIL) 
		{
			$('#conf_cont').append(createRow('conf_cont_v4l'));
			$('#conf_cont_v4l').append(createOptPanel('fa-camera', $.i18n("edt_conf_v4l2_heading_title"), 'editor_container_v4l2', 'btn_submit_v4l2'));
			$('#conf_cont_v4l').append(createHelpTable(window.schema.grabberV4L2.properties, $.i18n("edt_conf_v4l2_heading_title")));
		}
	}
	else
	{
		$('#conf_cont').addClass('row');    
		if(V4L2_AVAIL) 
		{
		  $('#conf_cont').append(createOptPanel('fa-camera', $.i18n("edt_conf_v4l2_heading_title"), 'editor_container_v4l2', 'btn_submit_v4l2'));
		}
	}


	if(V4L2_AVAIL) 
	{
		conf_editor_v4l2 = createJsonEditor('editor_container_v4l2', { grabberV4L2 : window.schema.grabberV4L2}, true, true);

		conf_editor_v4l2.on('change',function() {
			if (conf_editor_v4l2.validate().length || window.readOnlyMode)
				$('#btn_submit_v4l2').attr('disabled', true);
			else
				$('#btn_submit_v4l2').attr('disabled', false);
		});

		conf_editor_v4l2.on('ready', function() {
			setWatchers(v4l2_dynamic_enum_schema);

			if (window.serverInfo.grabbers != null && window.serverInfo.grabbers != undefined &&
			  window.serverInfo.grabbers.active != null && window.serverInfo.grabbers.active != undefined)
			{
				var grabbers = window.serverInfo.grabbers.active;
				if (grabbers.indexOf('V4L2:macOS AVF') > -1)
				{
					conf_editor_v4l2.getEditor('root.grabberV4L2.device_inputs').disable();
					conf_editor_v4l2.getEditor('root.grabberV4L2.hardware_brightness').disable();
					conf_editor_v4l2.getEditor('root.grabberV4L2.hardware_contrast').disable();
					conf_editor_v4l2.getEditor('root.grabberV4L2.hardware_hue').disable();
					conf_editor_v4l2.getEditor('root.grabberV4L2.hardware_saturation').disable();
				}
				if (grabbers.indexOf('V4L2:Media Foundation') > -1)
				{
					conf_editor_v4l2.getEditor('root.grabberV4L2.device_inputs').disable();         
				}
			}

			if (window.serverConfig.grabberV4L2.device == 'auto')
				conf_editor_v4l2.getEditor('root.grabberV4L2.available_devices').setValue('auto');

			if (window.serverConfig.grabberV4L2.available_devices == 'auto') 
			{
				['device_inputs', 'resolutions', 'framerates', 'videoCodecs'].forEach(function(item) {
					conf_editor_v4l2.getEditor('root.grabberV4L2.' + item).setValue('auto');
					conf_editor_v4l2.getEditor('root.grabberV4L2.' + item).disable();
				});
			}

		});

		$('#btn_submit_v4l2').off().on('click',function() {
			var v4l2Options = conf_editor_v4l2.getValue();

			if (v4l2Options.grabberV4L2.available_devices != 'auto')
				v4l2Options.grabberV4L2.device = v4l2Options.grabberV4L2.available_devices;

			if (v4l2Options.grabberV4L2.available_devices == 'auto')
				v4l2Options.grabberV4L2.device = 'auto';

			if (v4l2Options.grabberV4L2.device_inputs != 'auto' && v4l2Options.grabberV4L2.available_devices != 'auto')
				v4l2Options.grabberV4L2.input = parseInt(v4l2Options.grabberV4L2.device_inputs);

			if (v4l2Options.grabberV4L2.device_inputs == 'auto')
				v4l2Options.grabberV4L2.input = -1;

			if (v4l2Options.grabberV4L2.resolutions != 'auto' && v4l2Options.grabberV4L2.available_devices != 'auto')
			{
				v4l2Options.grabberV4L2.width = parseInt(v4l2Options.grabberV4L2.resolutions.split('x')[0].trim());
				v4l2Options.grabberV4L2.height = parseInt(v4l2Options.grabberV4L2.resolutions.split('x')[1].trim());
			}

			if (v4l2Options.grabberV4L2.resolutions == 'auto')
			{
				v4l2Options.grabberV4L2.width = 0;
				v4l2Options.grabberV4L2.height = 0;
			}

			if (v4l2Options.grabberV4L2.framerates != 'auto' && v4l2Options.grabberV4L2.available_devices != 'auto')
				v4l2Options.grabberV4L2.fps = parseInt(v4l2Options.grabberV4L2.framerates);

			if (v4l2Options.grabberV4L2.framerates == 'auto')
				v4l2Options.grabberV4L2.fps = 15;
			
			if (v4l2Options.grabberV4L2.videoCodecs != 'auto' && v4l2Options.grabberV4L2.available_devices != 'auto')
				v4l2Options.grabberV4L2.v4l2Encoding = v4l2Options.grabberV4L2.videoCodecs;

			if (v4l2Options.grabberV4L2.videoCodecs == 'auto')
				v4l2Options.grabberV4L2.v4l2Encoding = 'NO_CHANGE';

			requestWriteConfig(v4l2Options);
		});
	}

  

	//create introduction
	if(window.showOptHelp) {    
		if(V4L2_AVAIL){
		  createHint("intro", $.i18n('conf_grabber_v4l_intro'), "editor_container_v4l2");
		}
	}

	function hideEl(el) {
		for(var i = 0; i<el.length; i++) {
		  $('[data-schemapath*="root.framegrabber.'+el[i]+'"]').toggle(false);
		}
	}  

	removeOverlay();
});
