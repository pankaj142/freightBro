var app=angular.module('appModule', ["ngRoute"]);

app.config(function($routeProvider, $locationProvider) {
    //routes
    $routeProvider
      .when("/",{
        templateUrl : "views/ratesummary.html",
        controller : "rateSummaryCntrl"
      })
      .when("/summary",{
        templateUrl : "views/ratesummary.html",
        controller : "rateSummaryCntrl"
      })
      .otherwise({templateUrl : 'views/urlError.html'});

       //to remove # from route    
       $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
       });  
});

/*---------------DIRECTIVES ----------------------*/
app.directive('header',function(){
  return {
    restrict:"E",
    templateUrl : "views/directives/header.html"
  }
});
app.directive('footer',function(){
  return{
    restrict:"E",
    templateUrl : "views/directives/footer.html"
  }
});

app.directive('confirmationModal',function(){
  return{
    restrict:"E",
    templateUrl: "views/directives/confirmationModal.html"
  }
});

app.directive('addNewLegModal',function(){
  return{
    restrict: "E",
    templateUrl: "views/directives/addNewLegModal.html"
  }
});

app.directive('addNewChargeModal',function(){
  return{
    restrict: "E",
    templateUrl: "views/directives/addNewChargeModal.html"
  }
});
app.directive('chargeEditModal',function(){
  return{
    restrict: "E",
    templateUrl: "views/directives/chargeEditModal.html"
  }
});

app.directive('alert',function(){
  return{
    restrict: "E",
    templateUrl: "views/directives/alert.html"
  }
});
/*---------------DIRECTIVES ends here ----------------------*/

/* rate summary controller ---------------------------------*/
app.controller("rateSummaryCntrl", function($scope, $http, $filter){
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
    $scope.alertMessage="";


/* FUNCTION FOR SHOW ALERT WHEN CRUD OPERATIONS IS PERFORMED ------*/
    $scope.closeAlert= function(){
      $("#alert1").hide('fade');
    }

    $scope.showAlert= function(message){
      $scope.alertMessage= message;
      $("#alert1").show('fade');
      setTimeout(()=>{
        $scope.closeAlert();
        $scope.alertMessage="";
      },5000)
    }
/* FUNCTION FOR SHOW ALERT ends here ----------------------------*/

    //API CALL TO GET DATA
    $http.get("https://api.myjson.com/bins/1glgyd")
       .then(function(response){
        console.log(response)
        $scope.legDataDetails= response.data.leg_data;
        console.log("legDataDetails", $scope.legDataDetails)
         $scope.calcTotalBuyRate();
         $scope.calcTotalBreakUpRate();
       },function(error){
        console.log("error",error)
        $scope.showAlert("Please check Internet connetion and try again.")
       });

    //FUNCTION TO CALC TOTAL BUY RATE
    $scope.calcTotalBuyRate= function(){
      $scope.totalBuy= $scope.legDataDetails.reduce((total,leg)=>
         total + Math.round(leg.rate_card_obj.card_meta.total_cost)
      ,0);
      $scope.totaBuyRate= $filter('number')($scope.totalBuy, 0)
    }   

    //FUNCTION TO CALC TOTAL BREAKUP RATE
    $scope.calcTotalBreakUpRate = function(){
      $scope.totalBreakupRate= 100- ($scope.sellingRates/$scope.totalBuy)*100;
      $scope.totalBreakupRate= $filter("number")($scope.totalBreakupRate,1)
      console.log("totalBreakupRate",$scope.totalBreakupRate)
    }

/* FUNCTION FOR HIDE/SHOW CHARGE DETAILS---------------------------*/
    $scope.hideChargeDetails= function(){
      $scope.showChargeDetails= $scope.showChargeDetails ? false:true;
    }   
/* FUNCTION FOR HIDE/SHOW CHARGE DETAILS ends here----------------*/    

/* FUNCTION TO SHOW LEG DETAIL ON RHS ----------------------*/
    $scope.showLegOnRHS= function(selectedLeg){
      console.log("showLegOnRHS is clicked",selectedLeg)
      $scope.showLeg=true;
      $scope.showAllLegs=false;
      $scope.rhsSelectedLedData= selectedLeg;
      $scope.sellingRates= Math.round(selectedLeg.rate_card_obj.card_meta.total_cost);
      $scope.calcTotalBreakUpRate();
    }
/* FUNCTION TO SHOW LEG DETAIL ON RHS ends here ----------------------*/

/* FUNCTION TO REMOVE SELECTED LEG -------------------------*/
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
      $scope.showAlert(`You have successfully removed leg "${legName}" `)
    }
/* FUNCTION TO REMOVE SELECTED LEG ends here-------------------------*/    

/*   FUNCTION TO SHOW ALL LEGS ON RHS-----------------------------*/
    $scope.copyAllLegs= function(){
      console.log("copyAllLegs is clicked");
      $scope.showAllLegs= true;
      $scope.showLeg= false;
      $scope.sellingRates= $scope.totaBuyRate;
      $scope.calcTotalBreakUpRate();
    }


    $scope.pageRefreshConfirmation=function(){
      $('#pageRefreshConfirmationModal').modal('hide');
         $scope.copyAllLegs()
    }

    $scope.cancelPageRefresh= function(){
      $('#pageRefreshConfirmationModal').modal('hide');
    }
/*   FUNCTION TO SHOW ALL LEGS ON RHS ends here--------------------*/

/* FUNCTIONS => CREATE NEW LEG ----------------------------- */

    //FUNCTION TO SHOW NEW LEG ADD MODAL
    $scope.showAddLegModal= function(){
      $('#legModal').modal('show')
    }

    //FUNCTION TO HIDE LEG ADD MODAL
    $scope.hideAddLegModal= function(){
      $('#legModal').modal('hide')
      $scope.newLeg={};
    }

    //FUNCTION TO SAVE NEW LEG
    $scope.saveNewLeg= function(){
      $('#legModal').modal('hide')

      //show first charge modal
      $('#firstChargeModal').modal('show');

      $scope.newLegName= $scope.newLeg.leg_name;

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

    //FUNCTION TO SAVE FIRST CHARGE AFTER NEW LEG CREATED
    $scope.saveFirstCharge= function(){
      $('#firstChargeModal').modal('hide');
      $scope.firstCharge.leg_name=$scope.newLegData.leg_name;
      $scope.newLegLocal.rate_card_obj.card_charges.push($scope.firstCharge)
      
      let legDataLocal=JSON.parse(JSON.stringify($scope.legDataDetails));
      legDataLocal.push($scope.newLegLocal)

      $scope.legDataDetails= [...legDataLocal];
      //to calculate total buy rate again as new leg added
      $scope.calcTotalBuyRate();
      let firstChargeName= $scope.firstCharge.charge_name;
      $scope.showAlert(`You have successfully added new Leg "${$scope.newLegName}"
       and first charge "${firstChargeName}" `);
      $scope.firstCharge={};
    }

    //FUNCTION TO HIDE FIRST CHARGE MODAL
    $scope.hideFirstChargeModal=function(){
      $('#firstChargeModal').modal('hide');
      $scope.firstCharge={};
    }

/* FUNCTIONS => CREATE NEW LEG ends here ---------------------------*/

/* FUNCTION FOR CHARGE REMOVE ------------------------------------ */
    $scope.removeCharge= function(chargeName){
      let selectedLeg=JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      console.log("selectedLeg",selectedLeg);
      selectedLeg.rate_card_obj.card_charges= selectedLeg.rate_card_obj.card_charges.filter(function(i){
        return i.charge_name !== chargeName;
      })
      $scope.rhsSelectedLedData ={...$scope.rhsSelectedLedData, ...selectedLeg}
      
      console.log("$scope.rhsSelectedLedData",$scope.rhsSelectedLedData);
      $scope.showAlert(`You have successfully deleted charge "${chargeName}" `)
    }   
/* FUNCTION FOR CHARGE REMOVE ends here -------------------------- */

/* FUNCTIONS TO ADD NEW CHARGE ------------------------------------*/ 
    $scope.showAddChargeModal= function(){
      $('#newChargeModal').modal('show')
    }
    $scope.hideAddChargeModal= function(){
      $('#newChargeModal').modal('hide')
      $scope.newCharge= {};
    }
    //FUNCTION FOR NEW CHARGE SAVE
    $scope.saveNewCharge =function(){
       $('#newChargeModal').modal('hide')
      $scope.newCharge.leg_name= $scope.rhsSelectedLedData.rate_card_meta.leg_name;
      console.log("newCharge", $scope.newCharge)
      let newLed= JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      newLed.rate_card_obj.card_charges.push($scope.newCharge)
      console.log("newLed after added charge",newLed)
      $scope.rhsSelectedLedData= {...$scope.rhsSelectedLedData, ...newLed}
      let newChargeName= $scope.newCharge.charge_name;
      $scope.newCharge={};
      $scope.showAlert(`You have successfully added new charge "${newChargeName}".`)
    }
/* FUNCTIONS TO ADD NEW CHARGE ends here ------------------------------*/ 

/* FUNCTIONS TO HANDLE CHARGE EDIT ------------------------------------ */
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

/*  FUNCTION TO HANDLE CHARGE EDIT -----------------------------------*/
    $scope.saveEdit= function(){
      //MODAL HIDE
      $('#chargeEditModal').modal('hide')

      let LegData= JSON.parse(JSON.stringify($scope.rhsSelectedLedData));
      LegData.rate_card_obj.card_charges= LegData.rate_card_obj.card_charges.map(function(i){
         if(i.charge_name === $scope.chartName){
          return $scope.chargeEdit[0];
        }
        return i;
      });
      $scope.rhsSelectedLedData = {...$scope.rhsSelectedLedData, ...LegData}
      $scope.chargeEdit={}
      $scope.showAlert(`You have edited the charge "${$scope.chartName}"`);
    }
/* FUNCTIONS TO HANDLE CHARGE EDIT ends here------------------------------ */

});
/* rate summary controller ends here-------------------------------*/