
angular.module('QueryService', []);

angular.module('Query', ['QueryService' ]);

var routerApp = angular.module('app', 
    ['ui.router', 'ui.bootstrap', 'ui.select',
     'ngSanitize', 'Query', 'QueryService', 'ui.codemirror']
);

routerApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/query');

  $stateProvider

  .state('query', {
    url: '/query',
    templateUrl: 'query.html',
    controller: 'QueryController'
  });
});