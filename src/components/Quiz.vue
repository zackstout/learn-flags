<template>
  <div class="quiz">
    <h1>Test your Knowledge</h1>
    <h2>Can you identify this flag?</h2>

    <h4>Question {{ questionIndex + 1 }} of {{ questions.length }}</h4>

    <div
      v-if="flagFirst"
      class="flag-image"
      :style="{ backgroundImage: 'url(' + currentCorrectAnswer.flag + ')' }"
    ></div>
    <div style="font-size:5rem;" v-else>{{ currentCorrectAnswer.name }}</div>

    <div class="answers">
      <div v-for="(answer, i) in currentQuestion" :key="i" class="answer" @click="answerClick(answer)">
        <div v-if="flagFirst">{{ answer.name }}</div>
        <div v-else class="answer-flag" :style="{ backgroundImage: 'url(' + answer.flag + ')' }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

// TODO: Use a modal

// A quiz is an array of questions,
// each of which is an array of answers
interface QuizAnswer {
  name: string;
  flag: string;
  isCorrect: boolean;
}

@Component({
  components: {},
})
export default class QuizComponent extends Vue {
  @Prop({ default: true }) readonly flagFirst: boolean;
  @Prop() readonly questions: QuizAnswer[][];
  questionIndex = 0;
  answeredWrong = false; // controls whether "try again" modal/message shows

  mounted() {
    console.log("mount qz", this.questions);
  }

  get currentQuestion() {
    return this.questions.length > 0 ? this.questions[this.questionIndex] : [];
  }

  get currentCorrectAnswer() {
    return this.currentQuestion.find((x) => x.isCorrect);
  }

  answerClick(answer: QuizAnswer) {
    // - [ ] TODO: Handle right/wrong .... maybe gray out tried & wrong answers?

    if (answer.isCorrect) {
      if (this.questionIndex < this.questions.length - 1) {
        // Not yet last one
        this.questionIndex += 1;
      } else {
        // Last one -- must close out the quiz
        console.log("done!");
      }
    }
  }
}
</script>

<style scoped>
.flag-image,
.answer-flag {
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
}

.flag-image {
  height: 60vh;
  background-color: lightblue;
}

.answer-flag {
  height: 20vh;
}

.quiz {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 3rem;
}

.answers {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.answer {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  font-size: 2.5rem;
}

.answer:hover {
  background: lightblue;
  cursor: pointer;
}
</style>
