/**
 * Created by xiuchengquek on 25/02/2016.
 */
angular.module('capseq')
  .controller('GenomeController' , ['$scope', function($scope){



      $scope.sources = [
          {





          }





      ];

    var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data/output/'
      console.log('test')


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
      ucscName: 'hg19'
    },
    browserLinks: {
      Ensembl: 'http://www.ensembl.org/Homo_sapiens/Location/View?r=${chr}:${start}-${end}',
      UCSC: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr${chr}:${start}-${end}',
      Sequence: 'http://www.derkholm.net:8080/das/hg38comp/sequence?segment=${chr}:${start},${end}'
    },
    sources:     [{    name: 'Genome',
                       twoBitURI: file_server + 'hg19.2bit',
                       tier_type: 'sequence',
                       pinned: true,
                       provides_entrypoints: true},

                   {   name: 'GENCODE version 19',
                       bwgURI: file_server + 'gencode.v19.annotation.bb',
                       collapseSuperGroups: true,
                                              trixURI: file_server + 'gencode.v19.annotation.ix',
                       noSourceFeatureInfo: true,


                       },
                    {
                        name : 'Capture Region - Body Atlas',
                        bwgURI : file_server + 'captured_region_tissue.bb'
                    },
                    {
                        name : 'Capture Region - Melanoma',
                        bwgURI : file_server + 'captured_region_melanoma.bb'
                    }


]
  });









  }]);
