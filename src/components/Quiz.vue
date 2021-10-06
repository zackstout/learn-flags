<template>
  <div>
    <div class="modal"></div>
    <div class="modal-inner" ref="inner">
      <div v-if="complete">
        <div>Well done!</div>
      </div>

      <div class="quiz" v-else>
        <!-- <div style="font-size:3rem;">Test your Knowledge</div> -->
        <div style="font-size:3rem;">Can you identify this flag?</div>

        <div style="font-size:1.5rem; margin:2rem 0; display:flex;">
          <!-- <span>Question {{ questionIndex + 1 }} of {{ quiz.length }}</span> -->
          <div
            v-for="(x, i) in [...new Array(quiz.length)]"
            :key="i"
            style="width:8rem; margin: 0.2rem; background: blue; height: 0.8rem;"
            :style="{ opacity: questionIndex > i ? 1 : 0.3 }"
          ></div>
        </div>

        <div
          v-if="flagFirst"
          class="flag-image"
          :style="{ backgroundImage: getBgImage(currentQuestion.country) }"
        ></div>
        <div style="font-size:5rem;" v-else>{{ currentQuestion.country.name }}</div>

        <div class="message" :style="{ color: feedback.isError ? 'red' : 'green', margin: '1rem 0' }">
          {{ feedback.message }}
        </div>

        <div class="answers">
          <div v-for="(answer, i) in currentQuestion.answers" :key="i" class="answer" @click="answerClick(answer)">
            <div v-if="flagFirst">{{ answer.name }}</div>
            <div v-else class="answer-flag" :style="{ backgroundImage: 'url(' + answer.flag + ')' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { stub } from "@/App.vue";
import { getDatabase, ref, set } from "firebase/database";
import { State, Mutation, Getter } from "vuex-class";
import { QuizQuestion, Country } from "@/interfaces";

// TODO: Think we want vuex.....  reactivity is getting annoying with nesting and adding props via Object.assign....

@Component({
  components: {},
})
export default class QuizComponent extends Vue {
  @Prop({ default: true }) readonly flagFirst: boolean;
  // @Prop() readonly questions: QuizAnswer[][];

  @Getter quiz: QuizQuestion[];
  @Prop() db: any;

  feedback = {
    isError: false,
    message: "Choose an answer.",
  };

  complete = false;

  questionIndex = 0;
  answeredWrong = false; // controls whether "try again" modal/message shows

  getBgImage(country) {
    console.log("getbg", country);
    return "url(" + require(`@/images/svg/${country.code3.toLowerCase()}.svg`) + ")";
  }

  mounted() {
    // console.log("mount qz", this.questions.slice(0));
    // this.$nextTick(() => {
    (this.$refs.inner as HTMLElement).addEventListener("mousedown", (ev: any) => ev.stopPropagation());
    // });
  }

  get currentQuestion(): QuizQuestion {
    console.log("get cq", this.quiz.length, this.quiz[this.questionIndex]);
    if (this.quiz.length === 0) return { country: null, answers: [] };
    return this.quiz[this.questionIndex];
  }

  answerClick(answer: Country) {
    // - [ ] TODO: Handle right/wrong .... maybe gray out tried & wrong answers?
    // Just give some feedback.

    // OHO!  We don't update ANSWER's data, but QUESTION'S........
    // TODO: this not really working......
    // const questionCountry = this.currentQuestion.find((x) => x.isCorrect);

    const questionCountry = this.currentQuestion.country;
    const name = stub(questionCountry.name);
    // console.log(questionCountry.numAttempts, name);

    const info = {
      isUnlocked: questionCountry.isUnlocked,
      lastReviewed: questionCountry.lastReviewed,
      numAttempts: questionCountry.numAttempts,
      numCorrect: questionCountry.numCorrect,
    };

    if (answer.name === questionCountry.name) {
      // console.log("correct!");

      this.feedback.isError = false;
      this.feedback.message = "Choose an answer.";

      info.numCorrect += 1;
      if (this.questionIndex < this.quiz.length - 1) {
        // Not yet last one
        this.questionIndex += 1;
      } else {
        // Last one --
        // console.log("done!");
        this.complete = true;
      }
    } else {
      this.feedback.isError = true;
      this.feedback.message = "Shoot, that's not correct. Try again!";
    }
    info.numAttempts += 1;
    console.log("set with info", info.numCorrect, info.numAttempts);
    set(ref(this.db, `countries/${name}`), info);
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
  filter: drop-shadow(2px 2px 3px black);
}

.flag-image {
  height: 60vh;
}

.answer-flag {
  height: 20vh;
}

.quiz {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
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
