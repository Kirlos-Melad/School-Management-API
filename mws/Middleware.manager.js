module.exports = class MiddlewareManager {
	constructor() {
		this.httpExposed = ["get=myFunc"];
	}

	myFunc({ __helloworld }) {
		return __helloworld;
	}
};
