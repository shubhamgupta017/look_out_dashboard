// var urlBase = 'http://' + document.location.host + ':3000/hackathon';
var urlBase = "http://192.168.1.216:3000/v1";

jQuery(function($) {
	// $('body').panelSnap({
	// 	panelSelector: '.content section',
	// 	directionThreshold: 1
	// });
});

angular.module('lookout', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/dashboard', {
			templateUrl: 'dashboard.html'
		})
		.when('/alerts', {
			templateUrl: 'alerts.html',
			resolve: {
				'dummy': function(LoosService, LooIssuesService, $q){
					return $q.all([LoosService.promise, LooIssuesService.promise]);
				}
			}
		})
		.when('/loos/:looId', {
			templateUrl: 'loo.html',
			resolve: {
				'dummy': function(LoosService){
					// dummy will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
					return LoosService.promise;
				}
			}
		})
		.when('/loos', {
			templateUrl: 'loos.html',
			resolve: {
				'dummy': function(LoosService){
					// dummy will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
					return LoosService.promise;
				}
			}
		})
		.when('/loo-issues/:looId', {
			templateUrl: 'loo-issues.html',
			resolve: {
				'dummy': function(LoosService, LooIssuesService, $q){
					return $q.all([LoosService.promise, LooIssuesService.promise]);
				}
			}
		})
		.otherwise({redirectTo: '/dashboard'});
	}])
	.animation('.animate-fade', function() {
	  return {
	    enter: function(element, done) {
	      element.css('display', 'none');
	      element.fadeIn(200, done);
	      return function() {
	        element.stop();
	      }
	    },
	    leave: function(element, done) {
	      element.fadeOut(200, done)
	      return function() {
	        element.stop();
	      }
	    }
	  }
	})
	.factory('BroadcastService', function($rootScope) {
		return {
			message: '',

			broadcast: function(type, msg) {
				this.message = msg || '';
				$rootScope.$broadcast(type);
			}
		}
	})
	.factory('UserService', function() {
		return {
			knownUsers: ['admin'],
			knownNames: { 'admin': 'Administrator'},
			currentUserName: 'anonymous',
			isLoggedIn: function() {
				return this.currentUserName != 'anonymous';
			},
			setCurrentUser: function(username) {
				this.currentUserName = username;
			},
			getCurrentUser: function() {
				return this.currentUserName;
			},
			getProfilePic: function() {
				if(this.knownUsers.indexOf(this.currentUserName) != -1) {
					return 'images/profile-' + this.currentUserName + '.jpg';
				}
				return 'images/profile-anonymous.jpg';
			},
			getCurrentUserName: function() {
				return this.knownNames[this.currentUserName] || this.currentUserName;
			}
		};
	})
	.factory('LoosService', function($http) {
		var allLoos = [];

		var promise = $http.get(urlBase + '/loos', {}, { headers: {"Cache-Control": "no-cache"} })
			.success(function(response) {
				allLoos = response.loos.sort(function(a, b) { return a.id > b.id });
				// console.log("Received response: ", allLoos);
			});

		var service = {
			promise: promise,
			getLoos: function() {
				return allLoos;
			},
			getLoo: function(looId) {
				looId = parseInt(looId);
				for(var i = 0; i < allLoos.length; i++) {
					if (allLoos[i].id == looId) {
						return allLoos[i];
					}
				}
				return allLoos[looId];
			}
		};

		return service;
	})
	.factory('LooIssuesService', function($http) {
		var allIssues = [];

		var promise = $http.get(urlBase + '/loo-issues', {}, { headers: {"Cache-Control": "no-cache"} })
			.success(function(response) {
				allIssues = response.loos.sort(function(a, b) { return a.id > b.id });
				// console.log("Received response: ", allIssues)
			});

		var service = {
			promise: promise,
			getIssues: function() {
				return allIssues;
			},
			getIssuesFor: function(looId) {
				looId = parseInt(looId);
				for(var i = 0; i < allIssues.length; i++) {
					if (allIssues[i].id == looId) {
						return allIssues[i];
					}
				}
				return allIssues[looId];
			}
		};

		return service;
	})
	.factory('LooCountsService', function($http) {
		var allCounts = [];

		var promise = $http.get('http://' + document.location.host + ':3000/hackathon/loo-counts', {}, { headers: {"Cache-Control": "no-cache"} })
			.success(function(response) {
				allCounts = response.sort(function(a, b) { return a.id > b.id });
				// console.log("Received response: ", allCounts)
			});

		var service = {
			promise: promise,
			getCounts: function() {
				return allCounts;
			}
		};

		return service;
	})
  	.controller('ToolbarController', function($scope, $location, $route, UserService, BroadcastService) {  		
	    var toolbar = this;
	    
	    toolbar.loggedIn = false;
	    toolbar.showLoggedOutTools = true;
	    toolbar.showLoggedInTools = false;
	    toolbar.showLoginForm = false;

	    toolbar.logo = {
	    	text: 'Loo-k Out'
	    };
	    
	    toolbar.toplinks = [
	    	{ text: 'Dashboard', link: '/dashboard', active: true, adminOnly: false },
	    	{ text: 'Loos', link: '/loos', active: true, adminOnly: false },
	    	{ text: 'Issues', link: '/alerts', active: false, adminOnly: true }
	    ];

	    toolbar.isActive = function(toplink) {
	    	return toplink.active;
	    }

	    toolbar.loggedOutTools = [
	    	// { text: 'Sign up', link: 'signup' },
	    	{ text: 'Login', link: 'login' }
	    ];

	    toolbar.loggedInTools = [
	    	// { icon: 'dashboard', link: 'dashboard' },
	    	// { icon: 'bell', link: 'notifications' },
	    	{ icon: 'power-off', link: 'logout' }
	    ];

	    toolbar.navigateTo = function(link) {
	    	$location.url(link);
	    }

	    toolbar.activeLink = function() {
	    	var links = toolbar.toplinks;
	    	var newLocation = $location.path();
	    	var active = "";

	    	for(var i = 0; i < links.length; i++) {
	    		var link = links[i].link;
	    		if(newLocation.substring(0, link.length) == link) {
	    			active = 'toplink-' + link.substring(1);
	    			break;
	    		}
	    	}
	    	return active;
	    }

	    toolbar.submitLogin = function() {
	    	toolbar.showLoginForm = false;
			toolbar.loggedIn = true;
			toolbar.showLoggedOutTools = false;
			
			var username = $('.loginform input[name="username"]').val();
			if(username.trim().length > 0) {
				UserService.setCurrentUser(username);
			} else {
				UserService.setCurrentUser('anonymous');
			}
			var profilePic = UserService.getProfilePic();
			var logoutButton = toolbar.loggedInTools[toolbar.loggedInTools.length-1];
			if(profilePic) {
				logoutButton.icon = null;
				logoutButton.image = profilePic;
			} else {
				logoutButton.icon = 'power-off';
				logoutButton.image = null;
			}

			if(username.trim().length > 0) {
				setTimeout(function() { toolbar.showLoggedInTools = toolbar.loggedIn; }, 0);
			} else {
				toolbar.loggedIn = false;
				toolbar.showLoggedOutTools = true;
			}
	    }

	    toolbar.userAction = function(link) {
	    	switch(link) {
	    		case 'login':
	    			toolbar.showLoginForm = !toolbar.showLoginForm;
	    			toolbar.showLoginForm && setTimeout(function() { $('.loginform input[name="username"]').focus().select(); }, 0);
	    			break;
	    		case 'logout':
	    			toolbar.loggedIn = false;
	    			toolbar.showLoggedInTools = false;
	    			UserService.setCurrentUser('anonymous');
	    			setTimeout(function() { toolbar.showLoggedOutTools = true; }, 0);
	    			break;
	    	}
	    }

	    $scope.$on('$routeChangeSuccess', function(event, current, previous) {
	    	var links = toolbar.toplinks;
	    	var newLocation = $location.path();

	    	for(var i = 0; i < links.length; i++) {
	    		var link = links[i].link;
	    		if(newLocation.substring(0, link.length) == link) {
	    			links[i].active = true;
	    		} else {
	    			links[i].active = false;
	    		}
	    	}
		});

		$scope.$on('login', function() {
			toolbar.userAction('login');
		}); 
  	})
	.controller('DashboardController', function($location, UserService) {
		var dashboard = this;
		dashboard.getCurrentUser = function() {
			return UserService.getCurrentUser();
		}
		dashboard.sections = [
		];

		dashboard.navigateTo = function(link) {
	    	$location.url(link);
	    }
	})
	.controller('LoosController', function($scope, $location, LoosService) {
		var loos = this;
		loos.loos = LoosService.getLoos();
		
		$scope.clipRating = function(rating) {
			return Math.round(rating*100)/100;
		}
		loos.navigateTo = function(link) {
	    	$location.url(link);
	    }
	    $('[autofocus]:visible').focus();
	})
	.controller('LooController', function($scope, LoosService, UserService, BroadcastService, $routeParams) {
		var loo = this;
		loo.looId = $routeParams.looId;
		loo.details = LoosService.getLoo(loo.looId);
		loo.details.avg_rating = Math.round(loo.details.avg_rating*100)/100;
	})
	.controller('AlertsController', function($scope, $location, LoosService, LooIssuesService) {
		var alerts = this;
		alerts.issue_types = [ {type: "broken", label: "Broken"}, {type: "dirty", label: "Dirty"}, {type: "no_soap", label: "No Soap"}, {type: "no_water", label: "No Water"}, {type: "other", label: "Other"} ];
		function getIssues () {
			var loos = LoosService.getLoos();
			var issues = LooIssuesService.getIssues();
			var maxCount = 1;

			var issuesMap = {};
			for (var i = 0; i < issues.length; i++) {
				var issue = issues[i];
				issuesMap[issue.id] = issue;
			}

			for (var j = 0; j < loos.length; j++) {
				var loo = loos[j];
				var iss = issuesMap[loo.id];

				var issueCount = iss.no_soap_count + iss.no_water_count + iss.broken_count + iss.dirty_count + iss.other_count;
				if (issueCount > maxCount)
					maxCount = issueCount;
				loo.issues = iss;
				loo.numIssues = issueCount;
			}

			return {
				loos: loos,
				maxIssueCount: maxCount
			};
		}

	    alerts.navigateTo = function(link) {
	    	$location.url(link);
	    }
	    var _a = getIssues();
	    alerts.loos = _a.loos;
	    alerts.maxIssueCount = _a.maxIssueCount;
	  	$('[autofocus]:visible').focus();
	})
	.controller('LooIssuesController', function($scope, $location, LoosService, LooIssuesService, $routeParams, $http) {
		var looIssues = this;
		looIssues.looId = $routeParams.looId;

		looIssues.issue_types = [ {type: "broken", label: "Broken"}, {type: "dirty", label: "Dirty"}, {type: "no_soap", label: "No Soap"}, {type: "no_water", label: "No Water"}, {type: "other", label: "Other"} ];

		function _getIssues(loo, issues) {
			var maxCount = 1;
			var numIssues = 0;
			for(var i = 0; i < looIssues.issue_types.length; i++) {
				var it = looIssues.issue_types[i];
				numIssues += issues[it.type + '_count'];
				if (issues[it.type + '_count'] > maxCount)
					maxCount = issues[it.type + '_count'];
			}


			return {
				loo: loo,
				issues: issues,
				maxIssueCount: maxCount,
				numIssues: numIssues
			};
		}

		function getIssues () {
			var loo = LoosService.getLoo(looIssues.looId);
			var issues = LooIssuesService.getIssuesFor(looIssues.looId);

			return _getIssues(loo, issues);
		}

		$scope.convertToDateStr = function(time) {
			if (!time)
				return "-";
			var d = new Date(time);
			var m = d.getMonth() + 1;
			return d.getDate() + '/' + (m < 10 ? ('0' + m) : m) + '/' + d.getFullYear();
		}

		$scope.actionTaken = function(looId, issue_type) {
			// console.log(looId + ": " + issue_type);

			$http.get(urlBase + '/issues/resolve?gender=male&loo_id=' + looId + '&issue_type=' + issue_type.replace('_', ' '), {}, { headers: {"Cache-Control": "no-cache"} })
			.success(function(response) {
				// console.log(response);
				// $.toast({ heading: 'Action Taken', bgColor: '#dd8500', icon: 'success', loader: false, text: 'Updated', position: {top: '5px', right: '65px'}, hideAfter: 3000 });

				looIssues.issues[issue_type + '_count'] = 0;
				looIssues.issues[issue_type + '_since'] = null;

				var maxCount = 0;
				for(var i = 0; i < looIssues.issue_types.length; i++) {
					var it = looIssues.issue_types[i];
					if (looIssues.issues[it.type + '_count'] > maxCount)
						maxCount = looIssues.issues[it.type + '_count'];
				}
				looIssues.maxIssueCount = maxCount;
			});

		};

		$scope.remind = function(looId, issue_type, button) {
			// console.log(looId + ": " + issue_type);

			$http.get(urlBase + '/issues/remind?loo_id=' + looId + '&issue_type=' + issue_type.replace('_', ' '), {}, { headers: {"Cache-Control": "no-cache"} })
			.success(function(response) {
				$.toast({ heading: 'Reminder', bgColor: '#dd8500', icon: 'success', loader: false, text: 'SMS Sent', position: {top: '5px', right: '65px'}, hideAfter: 3000 })
			});

		};

	    looIssues.navigateTo = function(link) {
	    	$location.url(link);
	    }
	    var _a = getIssues();
	    looIssues.loo = _a.loo;
	    looIssues.issues = _a.issues;
	    looIssues.maxIssueCount = _a.maxIssueCount;
	    looIssues.numIssues = _a.numIssues;

	    looIssues.watch = function() {
	    	if (!looIssues.watchEnabled)
	    		return;

			$http.get(urlBase + '/loo-issues?id=' + looIssues.looId, {}, { headers: {"Cache-Control": "no-cache"} })
			.success(function(response) {
				issues = response.loos[0];
				// console.log(issues);

			    var _a = _getIssues(looIssues.loo, issues);

			    // console.log(_a.numIssues, looIssues.numIssues);

			    if (looIssues.numIssues !== _a.numIssues) {
			    	if (looIssues.numIssues < _a.numIssues) {
					    $.toast({ bgColor: '#ff6500', icon: 'warning', loaderBg: '#cc3300', loader: true, text: 'New Issue Reported', position: {top: '5px', right: '65px'}, hideAfter: 5000 });
			    	} else {
			    		$.toast({ icon: 'success', loaderBg: '#cc3300', loader: false, text: 'Issue resolved', position: {top: '5px', right: '65px'}, hideAfter: 5000 });
			    	}

				    looIssues.loo = _a.loo;
				    looIssues.issues = _a.issues;
				    looIssues.maxIssueCount = _a.maxIssueCount;
				    looIssues.numIssues = _a.numIssues;
				}

		    	setTimeout(looIssues.watch, 1500);
			});
	    }

	    looIssues.beginWatching = function() {
	    	looIssues.watchEnabled = true;

	    	looIssues.watch();
	    };

	    looIssues.stopWatching = function() {
	    	looIssues.watchEnabled = false;
	    };

		function init() {
			looIssues.beginWatching()
			$scope.$on('$destroy', function() {
				looIssues.stopWatching();
			});
		}

		init();
	})
	.directive('starRating',
		function() {
			return {
				restrict : 'A',
				template : '<ul class="rating">'
				   	+ ' <li ng-repeat="star in stars" ng-class="star">'
				   	+ '  <i class="fa fa-star"></i>'
				   	+ ' </li>'
				   	+ '</ul>',
				scope : {
					starValue : '=',
					max : '='
				},
				link : function(scope, elem, attrs) {
					var updateStars = function() {
				 		scope.stars = [];
				 		for ( var i = 0; i < scope.max; i++) {
				   			scope.stars.push({
				   				filled : i < scope.starValue
				   			});
				  		}
				 	};
				 
					scope.$watch('starValue',
						function(oldVal, newVal) {
					   		if (newVal) updateStars();
					 	}
					);
				}
			};
		}
	);