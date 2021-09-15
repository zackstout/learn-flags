export interface Country {
    name: string;
    flag: string;
    numAttempts: number;
    numCorrect: number;
    [prop: string]: any;
}

export interface QuizQuestionIndices {
    countryIndex: number;
    subregion: string;
    answerIndices: number[];
}

export interface QuizQuestion {
    country: Country;
    answers: Country[];
}
