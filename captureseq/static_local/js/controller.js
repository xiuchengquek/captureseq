/**
 * Created by xiuchengquek on 25/02/2016.
 */
angular.module('capseq')
  .controller('GenomeController' , ['$scope', function($scope){

    var file_server = 'https://pwbc.garvan.org.au/~xiuque/captureseq-data/output/'
      console.log('test')

      function gencodeFIP(feature, info) {
    'use strict';
    var isGene = false;
    for (var hi = 0; hi < info.hit.length; ++hi) {
      if (info.hit[hi].isSuperGroup){
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



    new Browser({
    chr:          '10',
    viewStart:    115779011,
    viewEnd:      115783011,
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
                       featureInfoPlugin: gencodeFIP


                       },
                    {
                        name : 'Capture Region - Body Atlas',
                        bwgURI : file_server + 'captured_region_tissue.bb'
                    },
                    {
                        name : 'Capture Region - Melanoma',
                        bwgURI : file_server + 'captured_region_melanoma.bb'
                    },

                    {
                        name : 'Capture Transcripts - Body Atlas',
                        bwgURI : file_server + 'capture_transcript_tissue_dirty_noas.bb',
                                               collapseSuperGroups: true,
                                               noSourceFeatureInfo: true,
                        featureInfoPlugin:   function(f, info) {
                            console.log(f['field15'])
                            console.log(info)
                          info.add('Testing', 'This is a test');
                      },

                    },
         {
                        name : 'Capture Transcripts - Melanoma',
                        bwgURI : file_server + 'capture_transcript_melanoma_dirty_noas.bb',
                                               collapseSuperGroups: true,
                                               noSourceFeatureInfo: true,
                        featureInfoPlugin:   function(f, info) {
                            console.log(f['field15'])
                            console.log(info)
                          info.add('Testing', 'This is a test');
                      }}]
  });










  }]);
