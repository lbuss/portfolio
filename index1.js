
function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(100, 50, -100 );
  
  controls = new THREE.OrbitControls( camera );
  scene = new THREE.Scene();

  var light = new THREE.DirectionalLight( 0xffffff, 2 );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( -1, -1, -1 ).normalize();
  scene.add( light );

  var geometry = new THREE.BoxGeometry( 20, 20, 20 );

  //these should really, really, really be in an object, refactor when have time
  var linkUrl = ["http://packoverflow.herokuapp.com"];
  var linkName = ["packoverflow", "asteroids", "trelloclone", "ChatApp"];
  var descriptions = ["PackOverflow is a loose clone of StackOverflow, built on Rails and Backbone. It demonstrates various aspects of database management and dynamic pages",
  "Asteroids is a javascript/html5 game utilizing asynchronous event handling",
  "TrelloClone is a Rails/Backbone app heavily utilizing the Twitter Bootstrap framework and the JQuery sortable feature",
  "ChatApp is a simple javascript chat client handled by server-side PHP"];       
  var count = 0
  
  for ( var i = 0; i < 2; i ++ ) {
    for ( var j = 0; j < 2; j++){
      (function(){
      var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
      object.text = linkName[count];
      object.link = linkUrl[0];
      object.description = descriptions[count];
      object.divName = 'link'+count;
      
      $('#linksWrap').append("<br><a href="+object.link+" target='_blank' id="+object.divName+">"+object.text+"</a><br>");
      
      object.position.x = Math.random() * 50 - 25;
      object.position.y = i*50 - Math.random() * 50;
      object.position.z = j*50 - Math.random() * 50;

      object.rotation.x = Math.random() * Math.PI - Math.PI/2;
      object.rotation.y = Math.random() * Math.PI - Math.PI/2;
      object.rotation.z = Math.random() * Math.PI - Math.PI/2;

      object.scale.x = Math.random() + 0.5;
      object.scale.y = Math.random() + 0.5;
      object.scale.z = Math.random() + 0.5;

      $("#"+object.divName).hover(function(){mark(object)}, function(){unmark(object)});
      
      scene.add( object );
      
      count +=1;
      })()
    }
  }

  projector = new THREE.Projector();
  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer();
  // renderer.setClearColor( 0xf0f0f0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;
  $('#container').append(renderer.domElement);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false);
  document.addEventListener( 'mousedown', onDocumentMouseDown, false);
  window.addEventListener( 'resize', onWindowResize, false );
  $('#description').remove();
}

function createInfo(object) {
  $('#description').remove();
  var div = document.createElement('div');
  var div2 = document.createElement('div');
  $(div).attr('id', 'description');
  $(div2).addClass('infoWrap');
  $(div2).html(object.description);
  $(div).html(div2);
  $('body').append(div);
  var pos = toScreenXY( object.position, camera, $('body'));
  $(div).css({
    top: pos[1],
    left: pos[0] + 50
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
          
function onDocumentMouseDown( event ) {
  event.preventDefault();   
  if(INTERSECTED){
    openInNewTab(INTERSECTED.link);
  }
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  moveCamera();
  var intersects = checkIntersects();
  intersectBehaviour(intersects);
  renderer.render( scene, camera );
}

function moveCamera(){
  theta += 0.1;
  camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
  // camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
  //             camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
  // camera.position.x += ( mouse.x - camera.position.x ) * 0.05;
  //             camera.position.y += ( - mouse.y - camera.position.y ) * 0.05;
  camera.lookAt( scene.position );
  
}

function checkIntersects(){
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );
  raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
  var intersects = raycaster.intersectObjects( scene.children );
  return intersects;
}

function mark(object){
  object.currentHex = object.material.emissive.getHex();
  object.material.emissive.setHex( 0xff0000 );
  createInfo(object);
} 

function unmark(object){
  console.log(object.text)
  object.material.emissive.setHex( object.currentHex );
  $('#description').remove();
}

function intersectBehaviour(intersects){
  
  if ( intersects.length > 0 ) {        
    
    if ( INTERSECTED != intersects[ 0 ].object ) {
      $("a").removeClass("highlighted");
      $('#description').remove();
      
      if ( INTERSECTED ) 
      INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
      $("#"+INTERSECTED.divName).addClass("highlighted");
      createInfo(INTERSECTED);
    }
  } else {
    
    if ( INTERSECTED ) 
    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    $("a").removeClass("highlighted");
    INTERSECTED = null;

  }
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function toScreenXY( position, camera, div) {
  var pos = position.clone();
  projScreenMat = new THREE.Matrix4();
  projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
  // pos.applyMatrix4(projScreenMat);
  pos.applyProjection(projScreenMat);
  // projScreenMat.multiplyVector3( pos );
  // var offset = findOffset(div);
  return [( pos.x + 1 ) * div.width() / 2, ( - pos.y + 1) * div.height() / 2 ]
  // return [ (pos.x+1) * 400-100, (1-pos.y) * 300];
}
  
          