/**
 * Created by xiuchengquek on 29/02/2016.
 */


angular.module('capseq')
    .service('defaultSettings', ['dataLoader', '$http', '$q', '$cookies', function(dataLoader, $http, $q, $cookies){

        var default_transcripts = 'TCONS_00047622' || $cookies.get('transcripts');
        var default_track = '/melanoma/' || $cookies.get('track');
        var default_transcripts_url = '/txinfo/' + default_transcripts;
        var default_expression_url = default_track + default_transcripts;

    }])
    .factory('dataLoader',  ['$http', '$q', function($http, $q){




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










    }])



