


// NOTE: This is one that we can "take all the way"
// So many "apps"  I've started and left half-done
// I think this is one we can "finish" and polish

// - [ ] TODO: show flags against a background color??
// - [x] TODO: Bigger flag in quiz
// - [x] TODO: flags do not show up in quiz in non-dev view

// - [ ] TODO: modal shoudl take up wholle screen (or at least hide flags)
// ahhh yeah why is it shifted down right????

// - [x] TODO: fix vuex issue with quiz questionsupdatiing

// - [ ] TODO: show number of unlocked flags out of total for each subregion

// - [ ] TODO: swap answers! lol

// - [ ] TODO: visual indication of wrong answer

// - [ ] TODO: indication that you can unlock flags? after you review enough
// - [ ] TODO: end of quiz view (maybe goes with previous one -- yeah I like it)

// - [ ] TODO: quiz for region button

// - [ ] TODO: ensure stuff never overflows modals

// - [x] TODO: Sort countries within subregion in MyFlags by whether isUnlocked
// - [x] TODO: do not show Unlock flags button if have all flags!

// - [ ] TODO: from game perspective, there should be motivev to review flags from subregion yu have unlocked all flags for
// Maybe you need to review all flags from  REGION within a day?

// - [ ] TODO: add tailwind --  just do when....
// - [ ] TODO : add vuex. HOPEFULLY deal with nested/reactivity issue

// - [ ] TODO: it will be FUN to go through and try to make it look halfway decent

// If looking for a detour -- get into Maps

// - [ ] TODO: think about how to  let other people use. browser/ip or somethinng as ID?
// Or just make an auth flow?
// If you host on Heroku will the 10 seconds to load be annoying?
// Can you deploy server-side with "now"??
// just liike "enter your username"????

// - [ ] TODO: show indicator that flag image is loading (or maybe it was just broken in non-dev view)

// - [ ] TODO: button to "flag" a flag as "want extra review" -- then it puts in every quiz  from that subregion
// Maybe a "i got it" button? to hide from quizzes?

// - [ ] TODO: tinker with unlock rules params

// - [ ] TODO: hide flag completely  if locked, not just opacity

// - [ ] TODO: hover flag increases scale? not sure. Because, can you click it??

// - [ ] TODO: re-imagine "numCorrect" as like...XP somehow? Just game-ify

// - [x] TODO: for locked, show "Capital: ???" or just "???" ? lean toward just "???"

// - [ ] TODO: subregions, and prob regions should be Accordions.

// - [ ] TODO: think about quiz params -- flagFirst??

// - [ ] TODO: main text could be smalller....toggle for size somewhere?

// - [ ] TODO: Unlock subregions not working.....?
// Oh no it is. We let  you unlock new continents for free right now.






// Ahhh...maybe we need/want this to preserve REFRENCSE
// So that quiz question gets updated by updating numAttemts on ccountry
// And we can read/watch/react to new value in here

// POSSIBLY this should just generate indices...?
// But why does itw ork the first time??? forfirst inncorrect an first correct/
// Welll...itnenver REACTS to that first upddate. So it doesnn't reallly "work oncce"
/// Kinda seemsit's not  reacting to first correct, after incorrect, also. Hmm...nno it is...

// I wonder if it's because this produces an array of arrays! Could that break the reactivity?
// Hmm...it shouldn't...
// Can we use Vue.set?
// do't even need ".iscorrect"  flag on questoins
// just use indices andpull from state? inn quiz?






// Must have reviewed X number in past however long duration?

// Must NOT  have any that have  NOT been reviwed for some duration?

// You'll want to tinker with  this.....because MAIN GOAL FOR THIS APP
// is to ensure that I am forced to review things thoroughly before going on to grab more to learn.
// The POINT is gatekeeping and game-ifying the whole "unlocking new flags" process.
// FORCING review first.

// First element in NUMBER_REVIEWS means have 0-2 unlocked, need 0 successes
// Second means have 3-5 unlocked, need 6 successes to unlock more




  //   getMostRecentlyReviewedCountries() {}

  //   // Only need this for case user unlocks but doesn't review......which we do care about because we say "unlocked"
  //   getMostRecentlyUnlockedCountries() {}

  //   getCountriesWithMissesInSubregion(subregion: string) {
  //     // Good for populating quiz of "try again" flags
  //   }

  //   getTotalSuccessesInSubregion(subregion: string) {
  //     // Should sum how many times each country/flag in the subregion has been successfully reviewed
  //   }

  //   getTotalReviewsInSubregion(subregion: string) {
  //     // Should sum how many times each country/flag in the subregion has been reviewed
  //   }





      // This *should* "just work" ... and cause subregionCountries to update
      // I think this is causing "only respond to first answer click" issue....
      // No, this just stops being called....
      // And the reason is that the data in firebase is not actually updating. Makes sense.
      // So issue could be here....it's not actually reacting to first real change to DB.

      // - [ ] TODO: It MIGHT fix things if we have a row in database for each country..
      // this.databaseCountries = Object.keys(data).map((name) => {
      //   // console.log(data[name].numAttempts);
      //   return { name, ...data[name] };
      // });



  // [x] Should merge together databaseCountries (info from DB) with allSubregions, which is API data
  // [x] Should return array  of subregions, each of which has name and countries, which have merged data
  // [x] Huh...not sure why change to databaseCountries doesn't trigger change here...Change to array?

  // Is nesting messing up reactivity?
  // Not seeing isUnlocked come through....
  // Ahhhh adding new props does not trigger changes (???)
  // get subregionCountries() {
  //   return this.allSubregions.map((subregion) => {
  //     return {
  //       name: subregion.name,
  //       countries: subregion.values.map((country) => {
  //         let c = this.databaseCountries.find((c) => unstub(c.name) === country.name);

  //         // Try to get around "no reactivity if adding props" issue -- justuse vuex state
  //         if (!c) {
  //           c = {
  //             isUnlocked: false,
  //             numAttempts: 0,
  //             numCorrect: 0,
  //             lastReviewed: false,
  //           };
  //         }
  //         return Object.assign({}, country, c);
  //       }),
  //     };
  //   });
  // }



// what?! so many aspect ratios: https://en.wikipedia.org/wiki/List_of_aspect_ratios_of_national_flags

/*
= Should be "learning phase" for a flag (group).
= Shouldn't be able to learn more than 3 new ones without having to review them before getting more.
= This is main principle: force to review before move on to new.

1. Unlock system for subregions

2. Unlock system for countries
-after have reviewed all? But..you have to immediately "review" upon test. Does review mean retest?
-put a day-limit on. Can only unlock x per day (>>>> so data needs unlockedDate, i think ****)
- eh, not needed...just growing requirements of how many reviews must do?

3. Learn new flags view
-tap/slide through carousel
-then click "take quiz/test"
-they are...scoped to a particular subregion, drawn from Locked countries in there

4. Quiz generation system
-Can be either review-level (has seen x times), OR subregion level (most likely), OR just all/fixed number of random reviews
-Can be either FLAG-FIRST, or COUNTRY-FIRST..
-..maybe random? random by quiz or by question?
-start with "by subregion"

5. Quiz answer generation system
*** -Try to pull at least a few from ones user has seen ***
-Stretch: try to trick with similar by color/design
-Probably just pull from same region (to start)

6. Design "unlocked flags" view
- show checkmark/"x" history of attempts for each
- show some kind of larger stats for region (maybe a different view though...)
- show all info from API

NOTE: To start can just focus on subregions, don't worry about grouping into larger regions.

7. a MAP!
- could be sick

quiz options...
- all of level x (i.e i've seen it x times)
- all of subregion
- all! (either all all, or random of certain number)

Some fun message that you can unlock new flags. :)


TODOS:
- [x] Add regions, put subregions under them in MyFlags
- [x] Put "learn flags" and "test" behind buttons, and in modals
- [x-ish] Wire up tracking of answers
- [x] Build out view of MyFlags (flag cards, gray out locked countries and subregions and regions)
- [x] test quiz generation logic for subregions and regions
- [x] add logic for "can unlock new flags" and "can unlock new regions" (latter should be very easy)
- [ ] need "today" logic
- [x] add messaging/feedback for "can't unlock yet"
- [ ] (expose more quiz buttons for each? only show one at time?)
- [ ] clarify quiz params.. flagfirst, pool (easy...), number? Just choose at random?
- [ ] would like it to LOOK/FEEL good!
- [ ] just setup vuex state


Quiz stuff:

// NOTE: this may need  to take in MORE than just pool (of quiz questions), to generate  answers
// Maybe to start...Just pull from all countries/flags?
// OOOOH but then it's too easy, because if quiz is scoped to Subregion....they can eliminate too many....
// If possible only pull in ones you've seen???

// Just returns array of arrays of answers. Each question is just that array of answers.
// The "isCorrect" one will let you build the markup for the quiz question.
// This structure should let either a flag-first OR a country-first quiz consume this..

// "Pool" will be e.g. all once-seen countries,
// or all subregion countries that are unlocked, or region countries that are unlocked
// maxNum will almost always be 5 (??)
// "Pool" represents possible ANSWERS
// The list of questions will come from there, AS WELL AS ALL POSSIBLE ANSWERS

// Issue: what about when we know what quiz is on - e.g. just unlocked - but possible answers are more?
// Optional parameter: list of "pre-picked" questions, I guess

// One wrinkle: add to pool if countryFirst (because random flags are good and cool)
*/
