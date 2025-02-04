import { cleanTranscription, displayLexicalEntries } from './helpers.js'
import { analysisLexical, analysisFeatures } from "./workersAnalysis.js"
import { searchCorpus, processSearchLexical, drawSearchLexical } from "./workersSearch.js"
import { lexicalListLabels, locationLabels, periodLabels } from './labels.js'

export function analysisPost(req, res) {
    const transcription = req.body.transcription

    // create a URL
    const queryParams = new URLSearchParams({
        transcription
    })

    // send the URL data and the user to a new page
    res.redirect(`/analysisResults?${queryParams.toString()}`)
}

export function analysisResultsGet(req, res) {
    const { transcriptionArray, transcriptionString } = cleanTranscription(req.query.transcription)

    // operate on the array
    const { foundLexicalItems } = analysisLexical(transcriptionArray)
    const { foundTheonyms, foundTimeExpressions, foundToponyms } = analysisFeatures(transcriptionArray)

    const processedLexicalEntries = processLexical(lexicalAttestations)

    // render the results page
    res.render('analysisResults', {data: 
        { 
            // features - does it contain time expressions, original metadata ('colophon'), lexical items, is it a ration list?
            features: {
                isRations: false, // placeholder
                lexicalItems: processedLexicalEntries,
                originalMetadata: '',  // placeholder

                theonyms: foundTheonyms,
                timeExpressions: foundTimeExpressions,
                toponyms: foundToponyms
            },
            
            // type
            certainty: 0, // placeholder
            prediction: 'uncertain', // placeholder
            text: transcriptionString
        },
        lexicalListLabels
    })
}

export function searchPost(req, res) {
    const term = req.body.term
    const timePeriods = req.body.timePeriod
    const provenience = req.body.provenience

    const distinguishVariantsFlag = req.body.distinguishVariants === '1'
    const splitCompoundsFlag = req.body.splitCompounds === '1'

    const queryParams = new URLSearchParams({
        term, 
        timePeriods,
        provenience,

        distinguishVariantsFlag,
        splitCompoundsFlag
    })
    
    res.redirect(`/searchResults?${queryParams.toString()}`);
}

export function searchResultsGet(req, res) {
    const { term, timePeriods, provenience, distinguishVariantsFlag: distinguishVariants, splitCompoundsFlag: split } = req.query;

    // Convert string values to booleans
    const distinguishVariantsFlag = distinguishVariants === 'true'
    const splitCompoundsFlag = split === 'true'

    if (term.split(',').length === 1) {
        const { _economicAttestations,
                _economicCompounds, 
                lexicalAttestations, 
                _lexicalCompounds 
            } = searchCorpus(term, timePeriods, provenience, distinguishVariantsFlag, splitCompoundsFlag)
        
        res.render('searchResults', {data: {
                lexicalItemsCount: lexicalAttestations.length,
                lexicalItems: drawSearchLexical(processSearchLexical(lexicalAttestations))
            },
            term
        })
    }
}