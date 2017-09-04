$(document).on('turbolinks:load', function() {  
	$('#manage_users_table').DataTable({
		responsive: true
	});	
	$('#more_maps_table').DataTable({
		responsive: true
	});	
	$('#vsd_table').DataTable({
		responsive: true
	});	
	$('#graphColorPicker').minicolors({
		theme:'bootstrap'
	})
	//Slide button
	var clicked=false;
	$("#settingsBtn").on('click', function(){
	    if(clicked){
	        clicked=false;        
	        $( "#settings-section" ).animate({right:-400}, 500);
	        $(this).animate({right:0},500);
	    }else{	        
	        clicked=true;                
	        $( "#settings-section" ).animate({right: 0}, 500);    
	        $(this).animate({right:400},500);
	    }
	});
});

