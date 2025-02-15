const MiddlewaresLoader = require("./MiddlewaresLoader");
const ApiHandler = require("../managers/api/Api.manager");
const LiveDB = require("../managers/live_db/LiveDb.manager");
const UserServer = require("../managers/http/UserServer.manager");
const ResponseDispatcher = require("../managers/response_dispatcher/ResponseDispatcher.manager");
const VirtualStack = require("../managers/virtual_stack/VirtualStack.manager");
const ValidatorsLoader = require("./ValidatorsLoader");
const ResourceMeshLoader = require("./ResourceMeshLoader");
const utils = require("../libs/utils");

const systemArch = require("../static_arch/main.system");
const TokenManager = require("../managers/token/Token.manager");
const SharkFin = require("../managers/shark_fin/SharkFin.manager");
const TimeMachine = require("../managers/time_machine/TimeMachine.manager");
//const MiddlewareManager = require("../mws/Middleware.manager");
const MongoLoader = require("./MongoLoader");
const UsersManager = require("../managers/entities/user/Users.manager");
const SchoolsManager = require("../managers/entities/school/Schools.manager");
const ClassroomsManager = require("../managers/entities/classroom/Classrooms.manager");
const ManagersMediator = require("../managers/entities/ManagersMediator.manager");

/**
 * load sharable modules
 * @return modules tree with instance of each module
 */
module.exports = class ManagersLoader {
	constructor({ config, cortex, cache, oyster, aeon }) {
		this.managers = {};
		this.config = config;
		this.cache = cache;
		this.cortex = cortex;

		this._preload();
		this.injectable = {
			utils,
			cache,
			config,
			cortex,
			oyster,
			aeon,
			managers: this.managers,
			validators: this.validators,
			// mongomodels: this.mongomodels,
			resourceNodes: this.resourceNodes,
		};
	}

	_preload() {
		const validatorsLoader = new ValidatorsLoader({
			models: require("../managers/_common/schema.models"),
			customValidators: require("../managers/_common/schema.validators"),
		});
		const resourceMeshLoader = new ResourceMeshLoader({});
		//const mongoLoader = new MongoLoader({ schemaExtension: "manager.js" });

		this.validators = validatorsLoader.load();
		this.resourceNodes = resourceMeshLoader.load();
		//this.mongo_managers = mongoLoader.load();
	}

	load() {
		this.managers.responseDispatcher = new ResponseDispatcher();
		this.managers.liveDb = new LiveDB(this.injectable);
		const middlewaresLoader = new MiddlewaresLoader(this.injectable);
		const mwsRepo = middlewaresLoader.load();
		const { layers, actions } = systemArch;
		this.injectable.mwsRepo = mwsRepo;
		/*****************************************CUSTOM MANAGERS*****************************************/
		this.managers.shark = new SharkFin({
			...this.injectable,
			layers,
			actions,
		});
		this.managers.timeMachine = new TimeMachine(this.injectable);
		this.managers.token = new TokenManager(this.injectable);
		//this.managers.middleware = new MiddlewareManager(this.injectable);
		// this.managers.mongo = Object.entries(this.mongo_managers).reduce(
		// 	(prev, [key, value]) => {
		// 		prev[key.toLowerCase()] = new value(this.injectable);
		// 		return prev;
		// 	},
		// 	{},
		// );

		this.managers.managersMediator = new ManagersMediator({
			...this.injectable,
			UsersManager: new UsersManager(this.injectable),
			SchoolsManager: new SchoolsManager(this.injectable),
			ClassroomsManager: new ClassroomsManager(this.injectable),
		});

		this.managers.users = new UsersManager(this.injectable);
		this.managers.schools = new SchoolsManager(this.injectable);
		this.managers.classrooms = new ClassroomsManager(this.injectable);
		/*************************************************************************************************/
		this.managers.mwsExec = new VirtualStack({
			...{ preStack: [/* '__token', */ "__device"] },
			...this.injectable,
		});
		this.managers.userApi = new ApiHandler({
			...this.injectable,
			...{ prop: "httpExposed" },
		});
		this.managers.userServer = new UserServer({
			config: this.config,
			managers: this.managers,
		});

		return this.managers;
	}
};
