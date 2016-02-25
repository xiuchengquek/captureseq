/**
 * Created by xiuchengquek on 25/02/2016.
 */
angular.module('capseq')
  .controller('GenomeController' , ['$scope', function($scope){



      $scope.sources = [
          {





          }





      ];

      new Browser({
    chr:          '22',
    viewStart:    30000000,
    viewEnd:      30030000,
    cookieKey:    'human',

    coordSystem: {
      speciesName: 'Human',
      taxon: 9606,
      auth: 'NCBI',
      version: '36',
      ucscName: 'hg18'
    },

    sources:     [{name:                 'Genome',
                   uri:                  'http://www.derkholm.net:8080/das/hg18comp/',
                   tier_type:            'sequence',
                   provides_entrypoints: true},
                  {name:                 'Genes',
                   desc:                 'Gene structures from Ensembl 54',
                   uri:                  'http://www.derkholm.net:8080/das/hsa_54_36p/',
                   collapseSuperGroups:  true,
                   provides_karyotype:   true,
                   provides_search:      true},
                  {name:                 'Repeats',
                   uri:                  'http://www.derkholm.net:8080/das/hsa_54_36p/',
                   stylesheet_uri:       'http://www.derkholm.net/dalliance-test/stylesheets/ens-repeats.xml'},
                  {name:                 'MeDIP raw',
                   uri:                  'http://www.derkholm.net:8080/das/medipseq_reads'},
                  {name:                 'MeDIP-seq',
                   uri:                  'http://www.ebi.ac.uk/das-srv/genomicdas/das/batman_seq_SP/'}]
  });










  }]);
