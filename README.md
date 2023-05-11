# tote-betting-executor 
- Tote-betting-executor is nest.js based api server that can automate your tote-betting startegy in HKJC. 
- This project is composed of Postgres DB, hasura console for monitoring and graphql(if needed) and core Nest.js api server. 
- Your model can be implemented under `services/custom-module` and just plug to the existing executor service to apply your model to betting. 

--- 

# How to use  
- Before running the service, make sure **port 3003, 61790 and 61791 is not in use** 

### 1. Install all packages
```shell
yarn install
```

### 2. Start DB & hasura console
- Start postgres database and hasura database console(gql engine), we are using hasura mainly for migration follow up and monitoring purpose. It could be used as graphql sever and customize your own api & control permission easily if required.  
```shell
yarn start:db
yarn hasura:console // run hasura console to check, password is set to `sidneyPassword`
```
### 3. Start nest.js api server 
- Runs in 3003 port in default
```shell
yarn start:api
```

### 4. Run test
- After running nest.js server, open another terminal and run below commands for testing 
```shell
yarn test:file // test executor service with given test file
yarn test:e2e // test whole e2e test covering api to execution results. 
```

### Others
- API documentation swagger is generated at http://localhost:3003/swagger-api.json after nest.js server is up.
- You may always set alerts(telegram etc..)on each exception event 
- All VALID data is saved in DB for future analytic purpose. 
- For lw latency, you can implement cache such as redis to hold most recent calculated candidate in-memory but dependes on model.

### Test Result 
- Currently, system executes the highest odds where system has received at the last moment. Unfortunately, they all lose if you just follow the highest odds at the last moment. You may check below DB through hasura console running in 61791 port.(Or just run **hasura console** at root)
<img width="1013" alt="image" src="https://user-images.githubusercontent.com/34973707/236894753-545d150d-abb8-4c4f-99b5-6ed835623850.png">



### Considerations 

- Modularity : This repository is strictly modularized by its responsibility. At the top of Nest.js structure(controller, service pattern), It is separating Business layer(Module, Executor) with Persistent layer(DB access). DB and hasura is containerized for good. Also, APIs are clearly defined under **controller**  

- Extensibility : This system is extensible since users may create their own customized services and attach to other modules following Nest.js recommended practice. Also, customized actions for each horse racing event type may be implemented in switch-case clause of executor.service.ts file https://github.com/hyossid/tote-betting-executor/blob/master/packages/services/executor/executor.service.ts#L25-L64

- Logging & Observability : Implemented logger gives sufficient logs on the execution of nest.js api server. You may sink logs to Elasticsearch if the system gets big in future, using ELK stack. Also, you can always set an alert to particular exceptions using a alert tool such as Telegraf

- Resilience : System handles exception and exception does not stop api server from running.
