(function(root){

var Index = root.Index = (root.Index || {});


Index.run = function() {

  var container, stats;
  var camera, scene, projector, raycaster, renderer;

  this.mouse = new THREE.Vector2(), this.INTERSECTED;
  this.radius = 100, theta = 0;

  Index.init();
  Index.animate();
  
}

Index.init = function() {


  // document.body.appendChild( container );
  //
  //             var info = document.createElement( 'div' );
  //             var infoWrap = document.createElement( 'div' );
  //             $(info).attr('id', 'links');
  //             $(infoWrap).addClass("infoWrap");
  //             $(infoWrap).html("My Work<br>");
  //             // info.style.backgroundcolor = 'rgba(255,255,255,0)';
  //             container.appendChild( info );
  //             $("#links").html(infoWrap);
  this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
            
  this.camera.position.set(100, 50, -100 );

  this.controls = new THREE.OrbitControls( this.camera );

  this.scene = new THREE.Scene();

  var light = new THREE.DirectionalLight( 0xffffff, 2 );
  light.position.set( 1, 1, 1 ).normalize();
  this.scene.add( light );

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( -1, -1, -1 ).normalize();
  this.scene.add( light );

  var geometry = new THREE.BoxGeometry( 20, 20, 20 );
            
  var linkUrl = ["http://packoverflow.herokuapp.com"];
  var linkName = ["packoverflow", "asteroids", "trelloclone", "snake"];
            
  var count = 0
  for ( var i = 0; i < 2; i ++ ) {
    for ( var j = 0; j < 2; j++){
      var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
      object.text = linkName[count];
      object.link = linkUrl[0];
      object.divName = 'link'+(i+j);
      $('#linksWrap').append("<br><a href="+object.link+" id="+object.divName+">"+object.text+"</a><br>");
      object.position.x = Math.random() * 50 - 25;
      object.position.y = i*50 - Math.random() * 50;
      object.position.z = j*50 - Math.random() * 50;

      object.rotation.x = Math.random() * Math.PI/2 - Math.PI/4;
      object.rotation.y = Math.random() * Math.PI/2 - Math.PI/4;
      object.rotation.z = Math.random() * Math.PI/2 - Math.PI/4;

      object.scale.x = Math.random() + 0.5;
      object.scale.y = Math.random() + 0.5;
      object.scale.z = Math.random() + 0.5;

      this.scene.add( object );
      count +=1;
    }
  }

  this.projector = new THREE.Projector();
  this.raycaster = new THREE.Raycaster();

  this.renderer = new THREE.WebGLRenderer();
  // renderer.setClearColor( 0xf0f0f0 );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.sortObjects = false;
  $('#container').append(this.renderer.domElement);

  // stats = new Stats();
  //             stats.domElement.style.position = 'absolute';
  //             stats.domElement.style.top = '0px';
            
  // container.appendChild( stats.domElement );

  document.addEventListener( 'mousemove', Index.onDocumentMouseMove, false);
  document.addEventListener( 'mousedown', Index.onDocumentMouseDown, false);

  //

  window.addEventListener( 'resize', Index.onWindowResize, false );
  
}

Index.onWindowResize = function() {

  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize( window.innerWidth, window.innerHeight );

}

Index.onDocumentMouseMove = function( event ) {

  event.preventDefault();

  this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}
          
Index.onDocumentMouseDown = function( event ) {

  event.preventDefault();
          
  if(INTERSECTED){
    window.location = INTERSECTED.link;
  }

}
//

Index.animate = function() {

  requestAnimationFrame( Index.animate );

  Index.render();
  // stats.update();

}

Index.render = function() {
  
  this.theta += 0.1;

  this.camera.position.x = this.radius * Math.sin( THREE.Math.degToRad( this.theta ) );
  // camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
  //             camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
  // camera.position.x += ( mouse.x - camera.position.x ) * 0.05;
  //             camera.position.y += ( - mouse.y - camera.position.y ) * 0.05;
  this.camera.lookAt( this.scene.position );

  // find intersections

  var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 1 );
  this.projector.unprojectVector( vector, this.camera );

  this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

  var intersects = this.raycaster.intersectObjects( this.scene.children );

  if ( intersects.length > 0 ) {
              
    if ( this.INTERSECTED != intersects[ 0 ].object ) {
      $("a").removeClass("highlighted");
      if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );

      this.INTERSECTED = intersects[ 0 ].object;
      this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
      this.INTERSECTED.material.emissive.setHex( 0xff0000 );
      $("#"+this.INTERSECTED.divName).addClass("highlighted");
    }

  } else {

    if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
    $("a").removeClass("highlighted");
    this.INTERSECTED = null;

  }

  Index.renderer.render( this.scene, this.camera );	

}
})(this);