/**
 * Created by xiuchengquek on 29/02/2016.
 */


angular.module('capseq')
    .service('defaultSettings', ['dataLoader', '$http', '$q', function(dataLoader, $http, $q){

        var default_transcripts = 'TCONS_00047622';
        var default_track = '/melanoma/';
        var default_transcripts_url = '/txinfo/' + default_transcripts;
        var default_expression_url = default_track + default_transcripts;


    }])
    .factory('dataLoader',  ['$http', '$q', function($http, $q){


      var self = {};


      self.diseaseMap = {};
      self.efoToDiseaseId = {};
      self.traitsByDiseaseId = {};


      function mapEfoToDiseaseId(efo_term){
        return self.efoToDiseaseId[efo_term]
      }


       function getTranscript(transcript_id){
            var url = '/txinfo/' + transcript_id
            return $http.get(url)
        }

        function getExpression(transcript_id, track){
            var url = track  + '/' +  transcript_id;
            return $http.get(url)
        }

        function widthData(data){
            var expression = [];
            angular.forEach(data, function(value, key){
                this.push({label : key, value : value})
            }, expression);
            return expression
        }

        function getTranscriptChangeInfo (transcript_id, info, track) {
            var txinfo = getTranscript(transcript_id);
            var expression = getExpression(transcript_id, track);
            return $q.all({ txinfo : txinfo, expression : expression })
              .then(function(results){
                  var transcriptData = results.txinfo.data;
                  transcriptData.track = track;
                  var expressionData = widthData( results.expression.data.expression);
                  return {
                      transcriptData  : transcriptData,
                      expressionData : expressionData
                  }
              })
        }
        function getRegionList(){
            var url = '/capturedregions/';
            return $http.get(url)
        }
        function loadDefault() {
            var txinfo = getTranscript('TCONS_00047715');
            var expressionData =  getExpression('TCONS_00047715', 'melanoma');
            var regionList = getRegionList();
            return $q.all({ txinfo : txinfo, expression : expressionData, regionList :  regionList})
              .then(function(results){
                  results.expression.data.expression = widthData( results.expression.data.expression );
                  return results
              })
        }

      function getDiseases() {
        return $http.get('/traits/all/').then(function(results){
          var disease = {};
          var allTraits = angular.copy(results.data);
          angular.forEach(allTraits, function(d,i,arr){
            this[d.disease_id] = d;
          },self.traitsByDiseaseId)
          self.diseaseMap = results.data;

          angular.forEach(results.data, function(value, idx){
            disease[value.parent_term]  = disease[value.parent_term] || [];
            disease[value.parent_term].push(value.efo_term)
          });
          angular.forEach(disease, function(value, key){
            this[key] = _.uniq(value)
          }, disease);

          angular.forEach(self.diseaseMap, function(value, idx){
            self.efoToDiseaseId[value.efo_term] = self.efoToDiseaseId[value.efo_term] || [];
            self.efoToDiseaseId[value.efo_term].push(value.disease_id)
          });

          angular.forEach(self.diseaseMap, function(value, key){
            this[key] = _.uniq(value)
        }, self.diseaseMap);
          return disease
        });
      }

      function getSnpsByLoci(){
        return $http.get('/snp/').then(function(results){
          return results.data
        })
      }

      function getSnpSpecificLocation(){
        return $http.get('/snp_loc/').then(function(results){
          var data = {};
          angular.forEach(results.data, function(d, i, arr){
             this[d.snp_id] = {
               'chr' : d.chr,
               'start' : d.start - 9,
               'end' : d.end + 10
             }
          },data);
          return data
        })
      }


      function getRegionToTx(loci_id){
        return $http.get('/capturedregions/transcripts/' + loci_id) +'/'.then(function(results){
          return results.data
        })
      }


      function getEfoToDiseaseMap(){
        return self.efoToDiseaseId
      }


      function getTraitsByDiseaseId(){
        return self.traitsByDiseaseId
      }





        return {
            getTranscriptChangeInfo : getTranscriptChangeInfo,
            loadDefault : loadDefault,
            getDiseases : getDiseases,
            mapEfoToDiseaseId  : mapEfoToDiseaseId,
            getEfoToDiseaseMap : getEfoToDiseaseMap,
            getSnpsByLoci : getSnpsByLoci,
            getRegionToTx : getRegionToTx,
            getTraitsByDiseaseId : getTraitsByDiseaseId,
            getSnpSpecificLocation : getSnpSpecificLocation
        }
    }]);



