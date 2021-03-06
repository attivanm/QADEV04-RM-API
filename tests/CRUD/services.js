//Services CRUD test cases by Joaquin Gonzales

var init = require('../../init.js');
var config = require(GLOBAL.initialDirectory+'/config/config.json');
var expect = require('chai').expect;
var assert = require('chai').assert;
//Configuration
var serviceConfig = require(GLOBAL.initialDirectory+config.path.serviceConfig);
var tokenAPI = require(GLOBAL.initialDirectory+config.path.tokenAPI);
var roomManagerAPI = require(GLOBAL.initialDirectory+config.path.roomManagerAPI);
var mongodb = require(GLOBAL.initialDirectory+config.path.mongodb);
var endPoints = require(GLOBAL.initialDirectory+config.path.endPoints);
//End Points
var url = config.url;
var serviceEndPoint = url+endPoints.services;
var serviceEndPointPost=serviceEndPoint + serviceConfig.postFilter;;
var serviceTypes = url+endPoints.serviceTypes;
var roomEndPoint = serviceEndPoint;
//this var helps to concat an End point to get an specific room
var rooms = endPoints.rooms;
//Global Variables
var token = null; 
var idService = 0;
var idRoom = null;
var servicefromDB = null;
var roomsfromDB = null;
var respService = null;
var ObjectId = require('mongodb').ObjectID;
//variables with Json Archives 
var serviceIdJson = serviceConfig.serviceId;
var servicejson = serviceConfig.service;
var roomDisplayJson = serviceConfig.roomDisplayJson;
var roomProperties = serviceConfig.PropertiesRoom;
var serviceProperties = serviceConfig.PropertiesService;
//status for response 200
var ok = config.httpStatus.Ok;

describe('CRUD Tesinting for Services Room Manager',function()
{
	this.timeout(config.timeOut);
	before(function(done)
	{
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		tokenAPI
			.getToken(function(err,res)
			{
				token = res.body.token;
				done();
			});
	});
	after(function(done)
	{
		token=null;
		done();
	});
	it('GET /serviceType CRUD testing, verify request fields for servicetype ',function(done)
	{
		roomManagerAPI
			.get(serviceTypes,function(err,res)
			{
				expect(res.status).to.equal(ok);
				expect(res.body[0]).to.have.property(serviceProperties.version);
				expect(res.body[0].version).to.equal(serviceProperties.zero);
				expect(res.body[0]).to.have.property(serviceProperties.name);
				expect(res.body[0].name).to.equal(serviceProperties.exchange);
				expect(res.body[0]).to.have.property(serviceProperties.support);
				expect(res.body[0].support[0]).to.equal(serviceProperties.Exchange);
				done();

			});		
	});
	it('GET /services CRUD testing, verify request fields for Service',function(done)
	{
		mongodb
			.findDocument('services',servicejson,function(res)
			{
				servicefromDB = res;
				roomManagerAPI
					.getwithToken(token,serviceEndPoint,function(err,res)
					{
						var resp=res.body[0];
						expect(res.status).to.equal(ok);
						expect(resp).to.have.property(serviceProperties.type);
						expect(resp.type).to.equal(servicefromDB.type);
						expect(resp).to.have.property(serviceProperties.name);
						expect(resp.name).to.equal(servicefromDB.name);
						expect(resp).to.have.property(serviceProperties.version);
						expect(resp.version).to.equal(servicefromDB.version);
						expect(resp).to.have.property(serviceProperties._id);
						expect(resp._id).to.equal(servicefromDB._id.toString());
						expect(resp).to.have.property(serviceProperties.impersonate);
						expect(resp.impersonate).to.equal(servicefromDB.impersonate);
						done();
					});
			});
	});
	describe('CRUD testing for service/serviceID',function()
	{
		
		beforeEach(function(done)
		{
			roomManagerAPI
				.getwithToken(token,serviceEndPoint,function(err,resp)
				{
					respService = resp;
					idService = resp.body[0]._id;
					done();
				});
		});
		it('GET /service/serviceID, CRUD testing for an specific service',function(done)
		{			
			serviceIdJson._id=ObjectId(idService);
			mongodb
				.findDocument('services',serviceIdJson, function(res)
				{	
					servicefromDB = res;
					expect(respService.status).to.equal(ok);
					var respServiceBody = respService.body[0];
					expect(respServiceBody).to.have.property(serviceProperties.type);
					expect(respServiceBody.type).to.equal(servicefromDB.type);
					expect(respServiceBody).to.have.property(serviceProperties.name);
					expect(respServiceBody.name).to.equal(servicefromDB.name);
					expect(respServiceBody).to.have.property(serviceProperties.version);
					expect(respServiceBody.version).to.equal(servicefromDB.version);
					expect(respServiceBody).to.have.property(serviceProperties._id);
					expect(respServiceBody._id).to.equal(servicefromDB._id.toString());
					expect(respServiceBody).to.have.property(serviceProperties.impersonate);
					expect(respServiceBody.impersonate).to.equal(servicefromDB.impersonate);
					done();
	
				});
		});
		it('GET /services/serviceId/rooms, CRUD testing for Email Server Rooms',function(done)
		{			
			roomEndPoint = roomEndPoint +'/'+ idService + rooms;
			mongodb
				.findDocuments('rooms',function(res)
				{
					roomsfromDB = res;
					roomManagerAPI
					.get(roomEndPoint,function(err,res)
					{
						expect(res.status).to.equal(ok);
						var responseRooms= res.body;
						expect(responseRooms.length).to.equal(roomsfromDB.length);
						expect(responseRooms[0]).to.have.property(roomProperties.emailAddress);
						expect(responseRooms[0]).to.have.property(roomProperties.displayName);
						expect(responseRooms[0]).to.have.property(roomProperties.serviceId);
						expect(responseRooms[0]).to.have.property(roomProperties._id);
						expect(responseRooms[0]).to.have.property(roomProperties.enabled);
						expect(responseRooms[0]).to.have.property(roomProperties.locationId);
						expect(responseRooms[0]).to.have.property(roomProperties.customDisplayName);
						done();
					});
				});
		});
		it('Get /service/serviceID/rooms/roomId, CRUD testing for an specific room',function(done)
		{

			mongodb
			.findDocument('rooms',roomDisplayJson,function(res)
			{
				roomsfromDB = res;
				roomEndPoint = roomEndPoint +'/'+roomsfromDB._id;
				roomManagerAPI
					.get(roomEndPoint,function(err,res)
					{
						expect(res.status).to.equal(ok);
						var responseRoom=res.body;
						expect(responseRoom).to.have.property(roomProperties.emailAddress);
						expect(responseRoom.emailAddress).to.equal(roomsfromDB.emailAddress);
						expect(responseRoom).to.have.property(roomProperties.displayName);
						expect(responseRoom.displayName).to.equal(roomsfromDB.displayName);
						expect(responseRoom).to.have.property(roomProperties.serviceId);
						expect(responseRoom.serviceId).to.equal(roomsfromDB.serviceId.toString());
						expect(responseRoom).to.have.property(roomProperties._id);
						expect(responseRoom._id).to.equal(roomsfromDB._id.toString());
						expect(responseRoom).to.have.property(roomProperties.enabled);
						expect(responseRoom.enabled).to.equal(roomsfromDB.enabled);
						expect(responseRoom).to.have.property(roomProperties.locationId);
						expect(responseRoom.locationId).to.equal(roomsfromDB.locationId);
						done();
					});
			});	
		});
	});
});