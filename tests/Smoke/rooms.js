//SmokeRooms
var init = require('../../init');
var expect = require('chai').expect;

var tokenAPI=require(GLOBAL.initialDirectory+'/lib/tokenAPI');
var config =require(GLOBAL.initialDirectory+'/config/config.json');
var endPoints=require(GLOBAL.initialDirectory+'/config/endPoints');

var resourceConfig = require(GLOBAL.initialDirectory+'/config/resource.json');
var roomManagerAPI=require(GLOBAL.initialDirectory+'/lib/RoomManagerAPI');
var util=require(GLOBAL.initialDirectory+'/util/util');
var token=null;
var room=null;
var resource=null;
var randomRoom=null;
var sendJson={"quantity": 5};
var json=null;
var resourceAsoc=null;
var endPoint=null;


describe('Smoke Testing for Room routes', function() {
	this.timeout(config.timeOut);

	/**
	 * Pre condition to execute the set Test Cases.
	 * @getToken(rollback)
	 * Obtain a token to an user account setting in the config.json file,
	 * Get a room randomly
	 */
	before('Before Set',function (done) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				endPoint=config.url+endPoints.rooms;
				roomManagerAPI.get(endPoint,function(err,resp){
					randomRoom=util.generateRandom(1,resp.body.length);
					room=resp.body[randomRoom];
					done();
				});

			});
	});

/**
 * Smoke Test to the service room with the method get.
 */
	it('Get /rooms , Verify the status 200',function(done){

		endPoint=config.url+endPoints.rooms;
		roomManagerAPI.
			get(endPoint,function(err,res){
				expect(res.status).to.equal(200);
				done();
			});
	});	

/**
 * Smoke Test to the service room with the method get for roomId getting 
 * randondly.
 */
	it('Get /rooms/{roomId}, Verify the status 200 ',function(done){
		
		endPoint=config.url+endPoints.rooms+'/'+room._id;

		roomManagerAPI.
			get(endPoint,function(err,res){
				expect(res.status).to.equal(200);
				done();
			});

	});	

/**
 * Smoke Test to the service room with the method put for modify the
 * display name of the room 
 */
	it('PUT /room/{roomId}, Verify the status 200',function(done)
	{			
		endPoint=config.url+endPoints.rooms+'/'+room._id;
		json={"customDisplayName": "customDisplayName Modified"};
		roomManagerAPI.
			put(token,endPoint,json,function(err,res){
				expect(res.status).to.equal(200);
				done();
			});	
	});
});

describe('Smoke Testing for Room Resources routes ', function() {
	this.timeout(config.timeOut);

	/**
	 * Pre condition to execute the set Test Cases.
	 * @getToken(rollback)
	 * Obtain a token to an user account setting in the config.json file,
	 * Get a room randomly and create a resource
	 */
	before('Before Set',function (done) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				endPoint=config.url+endPoints.rooms;
				roomManagerAPI
					.get(endPoint,function(err,resp){
						randomRoom=util.generateRandom(1,resp.body.length);
						room=resp.body[randomRoom];
						
						endPoint=config.url+endPoints.resources
						json=util.getRandomResourcesJson(resourceConfig.resourceNameSize);
							roomManagerAPI.post(token,endPoint,json,function(err,resourceRes){
								resource=resourceRes;
									var endPoint2=config.url+endPoints.rooms+'/'+room._id+'/resources';
									var json2={"resourceId": resource.body._id,"quantity": 1 };	
										roomManagerAPI.post
											(token,endPoint2,json2,function(err,resAsoc){
											resourceAsoc=resAsoc;
							
											done();
										});
																
							});	
					});				
			});		
	});


	after('Before Set',function (done) {
		endPoint=config.url+endPoints.resources+'/'+resource.body._id;
		roomManagerAPI
			.del(token,endPoint,function(err,resourceDel){
				done();	
			});	
	});

/**
 * Smoke Test to the service room with the method get for getting a resource for
 * a specific room .
 */
	it('GET /rooms/{roomId}/resources,Verify the status 200',function(done){	

		 			endPoint=config.url+endPoints.rooms+'/'+room._id+endPoints.resources;
		 			roomManagerAPI.get(endPoint,function(err,res){
		 				expect(res.status).to.equal(200);
			  			done();

		 			});			  				  			 						
	});	

/**
 * Smoke Test to the service room with the method POST 
 * for associates the room with an existent resource.
 */
	it('POST rooms/{:roomId}/resources, Verify the status 200',function(done){
			
					expect(resourceAsoc.status).to.equal(200);
			  		done();
	});

/**
 * Smoke Test to the service room with the method GET 
 * for getting a specific resources of a specific room.
 */
	it('GET /rooms/{:roomId}/resources/{:roomResourceId}, Verify the status 200',function(done){
															
			endPoint=config.url+endPoints.rooms+'/'+room._id+endPoints.resources+'/'+
					 resourceAsoc.body.resources[0]._id;		
				roomManagerAPI.get(endPoint,function(err,res){
					expect(res.status).to.equal(200);	
					done();
				})
	});	

 /**
 * Smoke Test to the service room with the method PUT
 * for Updating a specific resource from a specific room
 */			
	it('PUT /rooms/{:roomId}/resources/{:roomResourceId}, Verify the status 200',function(done){
				
				endPoint=config.url+endPoints.rooms+'/'+room._id+endPoints.resources+'/'+
					 resourceAsoc.body.resources[0]._id;
					 json={"quantity": 10};

				roomManagerAPI.put(token,endPoint,json,function(err,resp){
					expect(resp.status).to.equal(200);	
					done();		
				});
	});	
	
 /**
 * Smoke Test to the service room with the method DEL
 * for Removing a specific resource from a specific room
 */	
	it('DELETE /rooms/{:roomId}/resources/{:roomResourceId}, Verify the status 200 ',function(done){
						
			endPoint=config.url+endPoints.rooms+'/'+room._id+endPoints.resources+'/'+
					 resourceAsoc.body.resources[0]._id;
					 roomManagerAPI.del(token,endPoint,function(err,resp){
					 	expect(resp.status).to.equal(200);	
						done();			

					 });						
	});	

});