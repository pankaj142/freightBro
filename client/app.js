var app=angular.module('appModule', ["ngRoute"]);

app.config(function($routeProvider, $locationProvider) {
    //routes
    $routeProvider
      .when("/",{
        templateUrl : "views/ratesummary.html",
        controller : "freightbroCntrl"
      })
      
      .when("/summary",{
        templateUrl : "views/ratesummary.html",
        controller : "freightbroCntrl"
      })

      .otherwise({templateUrl : 'views/urlError.html'});

       //to remove # from route    
       $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
       });  
});

app.controller("freightbroCntrl", function($scope, $http, $filter){
    $scope.name="freightbroCntrl";
    $scope.rhsSelectedLedData="";
    $scope.chargeEdit={};
    $scope.newCharge={};
    $scope.newLeg={};
    $scope.showAllLegs=false;
    $scope.showLeg=false;
    $scope.showChargeDetails=true;
    $scope.sellingRates=0;
    $scope.totaBuyRate=0;
    $scope.totalBreakupRate=0;

    //API CALL TO GET DATA
    $http.get("https://api.myjson.com/bins/1glgyd")
       .then(function(response){
        console.log(response)
        $scope.legDataDetails= response.data.leg_data;
        //Object.freeze($scope.legDataDetails);
        console.log("legDataDetails", $scope.legDataDetails)
         $scope.calcTotalBuyRate();
         $scope.calcTotalBreakUpRate();
       });


    $scope.calcTotalBuyRate= function(){
      $scope.totalBuy= $scope.legDataDetails.reduce((total,leg)=>
         total + Math.round(leg.rate_card_obj.card_meta.total_cost)
      ,0);
      $scope.totaBuyRate= $filter('number')($scope.totalBuy, 0)
    }   

    $scope.calcTotalBreakUpRate = function(){
      $scope.totalBreakupRate= 100- ($scope.sellingRates/$scope.totalBuy)*100;
      $scope.totalBreakupRate= $filter("number")($scope.totalBreakupRate,1)
      console.log("totalBreakupRate",$scope.totalBreakupRate)
    }

    $scope.hideChargeDetails= function(){
      $scope.showChargeDetails=$scope.showChargeDetails ? false:true;
    }   

    $scope.showLegOnRHS= function(selectedLeg){
      console.log("showLegOnRHS is clicked",selectedLeg)
      $scope.showLeg=true;
      $scope.showAllLegs=false;
      $scope.rhsSelectedLedData= selectedLeg;
      $scope.sellingRates= Math.round(selectedLeg.rate_card_obj.card_meta.total_cost);
      $scope.calcTotalBreakUpRate();
    }
    $scope.removeLeg= function(){
      $scope.showLeg=false;
      let legName= $scope.rhsSelectedLedData.rate_card_meta.leg_name
      let legData=JSON.parse(JSON.stringify($scope.legDataDetails));
      let index= legData.findIndex(function(i){
        return i.rate_card_meta.leg_name === legName
      })
      let newLegData=[...legData.slice(0,index), ...legData.slice(index +1)]
      $scope.legDataDetails= newLegData;

      $scope.sellingRates=0;
      $scope.calcTotalBuyRate();
      $scope.calcTotalBreakUpRate();
    }

    $scope.copyAllLegs= function(){
      console.log("copyAllLegs is clicked");
      $scope.showAllLegs=true;
      $scope.showLeg=false;
      $scope.sellingRates=$scope.totaBuyRate;
      $scope.calcTotalBreakUpRate();
    }

    //FUNCTIONS => CREATE NEW LEG 

    //FUNCTION TO SHOW NEW LEG ADD MODAL
    $scope.showAddLegModal= function(){
      $('#legModal').modal('show')
    }

    //FUNCTION TO SHOW ADD NEW CHARGE MODAL
    $scope.hideAddLegModal= function(){
      $('#legModal').modal('hide')
      $scope.newLeg={};
    }

    $scope.saveNewLeg= function(){
      $scope.firstCharge={};

      //show first charge modal
      $('#firstChargeModal').modal('show');

      $scope.newLegData= $scope.newLeg;
      $scope.newLeg={};
      $scope.newLegLocal={
        "rate_card_meta":{
          "leg_name": $scope.newLegData.leg_name
        },
        "rate_card_obj":{
          "card_charges":[],
          "card_meta":{
            "currency": $scope.newLegData.currency,
            "total_cost" : $scope.newLegData.total_cost
          }
        }
      };
    }

    $scope.saveFirstCharge= function(){
      $scope.firstCharge.leg_name=$scope.newLegData.leg_name;
      $scope.newLegLocal.rate_card_obj.card_charges.push($scope.firstCharge)
      
      let legDataLocal=JSON.parse(JSON.stringify($scope.legDataDetails));
      legDataLocal.push($scope.newLegLocal)

      $scope.legDataDetails= [...legDataLocal];
      //to calculate total buy rate again as new leg added
      $scope.calcTotalBuyRate();
    }

    $scope.hideFirstChargeModal=function(){
      $('#firstChargeModal').modal('hide');
      $scope.firstCharge={};
    }

    //FUNCTIONS => CREATE NEW LEG ends here



    //FUNCTION FOR CHARGE REMOVE
    $scope.removeCharge= function(chargeName){
      let selectedLeg=JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      console.log("selectedLeg",selectedLeg);
      selectedLeg.rate_card_obj.card_charges= selectedLeg.rate_card_obj.card_charges.filter(function(i){
        return i.charge_name !== chargeName;
      })
      $scope.rhsSelectedLedData ={...$scope.rhsSelectedLedData, ...selectedLeg}
      
      console.log("$scope.rhsSelectedLedData",$scope.rhsSelectedLedData);
    }   

    //FUNCTION TO SHOW ADD NEW CHARGE MODAL
    $scope.showAddChargeModal= function(){
      $('#newChargeModal').modal('show')
    }
    $scope.hideAddChargeModal= function(){
      $('#newChargeModal').modal('hide')
      $scope.newCharge= {};
    }
    //FUNCTION FOR NEW CHARGE SAVE
    $scope.saveNewCharge =function(){
      $scope.newCharge.leg_name= $scope.rhsSelectedLedData.rate_card_meta.leg_name;
      console.log("newCharge", $scope.newCharge)
      let newLed= JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      newLed.rate_card_obj.card_charges.push($scope.newCharge)
      console.log("newLed after added charge",newLed)
      $scope.rhsSelectedLedData= {...$scope.rhsSelectedLedData, ...newLed}
      $scope.newCharge={};
    }


    //FUNCTION TO HANDLE CHARGE EDIT MODAL
    $scope.editCharge= function(chargeName){
      //MODAL SHOW
      $('#chargeEditModal').modal('show')
      console.log("chargeName",chargeName)
      let selectedLegEdit=JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      console.log("selectedLeg",selectedLegEdit);
      $scope.chargeEdit= selectedLegEdit.rate_card_obj.card_charges.filter(function(i){
        return i.charge_name === chargeName;
      })
      console.log("chargeEdit",$scope.chargeEdit)
      $scope.chartName= $scope.chargeEdit[0].charge_name;
      console.log("chartName",$scope.chartName)
    }

    //FUNCTION TO HANDLE CHARGE EDIT SAVE BUTTON
    $scope.saveEdit= function(){
      let LegData= JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      LegData.rate_card_obj.card_charges= LegData.rate_card_obj.card_charges.map(function(i){
         if(i.charge_name === $scope.chartName){
          return $scope.chargeEdit[0];
        }
        return i;
      });
      $scope.rhsSelectedLedData = {...$scope.rhsSelectedLedData, ...LegData}
      $scope.chargeEdit={}
    }

});