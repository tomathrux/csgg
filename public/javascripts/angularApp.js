app = angular.module("counters", ['ui.router', 'ui.bootstrap']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    })
    .state('counters', {
      url: '/counters/:cid',
      templateUrl: '/counters.html',
      controller: 'CountersCtrl'
    })
    .state('compare', {
      url: '/compare',
      templateUrl: '/compare.html',
      controller: 'MainCtrl'
    })
    .state('about', {
      url: '/about',
      templateUrl: '/about.html',
      controller: 'MainCtrl'
    })
    

  $urlRouterProvider.otherwise('home');
  
}]);

app.controller('MainCtrl', [
  '$scope',
  '$http',
  '$location',
  function($scope, $http, $location) {
    
  $scope.isActive = function (viewLocation) { 
        return viewLocation == $location.path();
  };
  
  $http.get('/getchampdata').success(function(response) {
    $scope.champData = response.champs
  })

  $http.get('/matchupsanalysed').success(function(response) {
      $scope.matchupsAnalysed = response.matchups;
  });
}]);

app.controller('CountersCtrl', [
  '$scope',
  '$stateParams',
  '$http',
  '$state',
  function($scope, $stateParams, $http, $state) {

    $scope.champData = "";
    $scope.weakAgainst = "";
    $scope.strongAgainst = "";
    $scope.cid = $stateParams.cid;
  
  
    $http.get('/getchampdata').success(function(response) {
      $scope.champData = response.champs
    })

    $scope.getObj = function(id) {
      var i = 0
      for (; i < $scope.champData.length; i++) {
       if (+($scope.champData[i].id) == +(id)) {
         return $scope.champData[i];
        }
      }
    }
    
    $scope.changeRole = function(role) {
      $scope.role = role
    }  
    
    $http.get('/primaryrole/' + $scope.cid).success(function(response) {
      delete response.cid1
      delete response._id
      sortedKeys = Object.keys(response).sort(function(a, b){return response[a] - response[b]})
      sortedKeys = sortedKeys.reverse()
      $scope.prole = sortedKeys[0]
      $scope.srole = sortedKeys[1]
      $scope.role = $scope.prole
      $http.get('/getmatchups/' + $scope.cid + '/' + $scope.role).success(function(response) {
        console.log(response.length)
        for (var i = 0; i < response.length; i++) {
          // Remove all but the most frequent items from c1
          sortedItems = Object.keys(response[i].c1items).sort(function(a, b) { return response[i].c1items[b] - response[i].c1items[a]})
          index = sortedItems.indexOf('0')
          sortedItems.splice(index, 1)
          response[i].c1items = sortedItems.slice(0, 6)
          // Remove all but the most frequent items from c2
          sortedItems = Object.keys(response[i].c2items).sort(function(a, b) { return response[i].c2items[b] - response[i].c2items[a]})
          index = sortedItems.indexOf('0')
          sortedItems.splice(index, 1)
          response[i].c2items = sortedItems.slice(0, 6)
          
          // Work out winrate for each matchup
          response[i].wr = ((response[i].c1wins / (response[i].c1wins + response[i].c2wins)) * 100).toFixed(2)
        }
        // Sort the matchups in order of winrate
        response.sort(function(a, b) {
          return a.wr - b.wr;
        });
        
        for (i = 0;(response[i].wr < 50); i++) {}
        var j = i
        if (i > 10) {i = 10}
        $scope.weakAgainst = response.splice(0, i)
        $scope.strongAgainst = response.splice(response.length - j, response.length).reverse()
      });

    });
}]);

