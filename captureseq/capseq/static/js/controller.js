/**
 * Created by xiuchengquek on 25/02/2016.
 */

angular.module('capseq')
    .controller('GenomeController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {

        var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data/output/';
        'use strict';

        function gencodeFIP(feature, info) {
            var isGene = false;
            for (var hi = 0; hi < info.hit.length; ++hi) {
                if (info.hit[hi].isSuperGroup) {
                    isGene = true;
                }
            }

            if (!isGene) {
                info.setTitle('Transcript: ' + feature.label);
                info.add('Transcript ID', feature.label);
                info.add('Transcript biotype', feature.method);

            } else {
                info.setTitle('Gene: ' + feature.geneId);
            }

            info.add('Gene ID', feature.geneId);
            info.add('Gene name', feature.geneName);
            info.add('Gene biotype', feature.geneBioType);

            if (!isGene) {
                info.add('Transcript attributes', feature.tags);
            }
        }

        function widthData(data){
            var expression = [];
            angular.forEach(data, function(value, key){
                this.push({label : key, value : value})
            }, expression)
            return expression
        }

        function dataParser(feature, info, track) {
            var url = track  + '/' +  feature.label;
            console.log(url)
            $http.get(url).then(function(results){
             $scope.$broadcast('expression_change', widthData(results.data.expression));
            });
            $scope.$digest();
        }


        function getTranscript(transcript_id){




        }

        new Browser({
            chr: '10',
            viewStart: 115779011,
            viewEnd: 115783011,
            cookieKey: 'human',

            coordSystem: {
                speciesName: 'Human',
                taxon: 9606,
                auth: 'NCBI',
                version: '36',
                ucscName: 'hg19'
            },
            browserLinks: {
                Ensembl: 'http://www.ensembl.org/Homo_sapiens/Location/View?r=${chr}:${start}-${end}',
                UCSC: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr${chr}:${start}-${end}',
                Sequence: 'http://www.derkholm.net:8080/das/hg38comp/sequence?segment=${chr}:${start},${end}'
            },
            sources: [{
                    name: 'Genome',
                    twoBitURI: file_server + 'hg19.2bit',
                    tier_type: 'sequence',
                    pinned: true,
                    provides_entrypoints: true
                },
                {
                    name: 'GENCODE version 19',
                    bwgURI: file_server + 'gencode.v19.annotation.bb',
                    collapseSuperGroups: true,
                    trixURI: file_server + 'gencode.v19.annotation.ix',
                    noSourceFeatureInfo: true,
                    featureInfoPlugin: gencodeFIP
                },
                {
                    name: 'Capture Region - Tissue',
                    bwgURI: file_server + 'captured_region_tissue.bb'
              },
                {
                    name: 'Capture Region - Melanoma',
                    bwgURI: file_server + 'captured_region_melanoma.bb'
                },
                {
                    name: 'Capture Transcripts - Tissue',
                    bwgURI: file_server + 'captured_transcript_tissue_noex.bb',
                    featureInfoPlugin : function(feat, info){
                        dataParser(feat, info, 'tissue')
                    }
                },
                {
                    name: 'Capture Transcripts - Melanoma',
                    bwgURI: file_server + 'captured_transcript_melanoma_noex.bb',
                    featureInfoPlugin : function(feat, info){
                        dataParser(feat, info, 'melanoma')
                    }

                }]
        });

        $scope.expression = {transcript_name : '', track : '', expression :
                            [   { label :  "adipose" , value : 1 },
                                { label :  "bladder" , value : 0 },
                                { label :  "brain" , value : 0 },
                                { label :  "breast" , value : 0 },
                                { label :  "cervix" , value : 0 },
                                { label :  "colon" , value : 0 },
                                { label :  "esophagus" , value : 0 },
                                { label :  "heart" , value : 0 },
                                { label :  "kidney" , value : 0 },
                                { label :  "liver" , value : 0 },
                                { label :  "lung" , value : 0 },
                                { label :  "ovary" , value : 0 },
                                { label :  "placenta" , value : 0 },
                                { label :  "prostate" , value : 0 },
                                { label :  "skmusc" , value : 0 },
                                { label :  "smint" , value : 0 },
                                { label :  "spleen" , value : 0 },
                                { label :  "testes" , value : 0 },
                                { label :  "thymus" , value : 0 },
                                { label :  "thyroid" , value : 10 },
                                { label :  "trachea"   , value : 0 }] }
    }]);
