# Blackjack Counting Simulator

<a name="readme-top"></a>

![NoamLoewenstern - blackjack-counting-simulator](https://img.shields.io/static/v1?label=NoamLoewenstern&message=blackjack-counting-simulator&color=blue&logo=github)
[![stars - blackjack-counting-simulator](https://img.shields.io/github/stars/NoamLoewenstern/blackjack-counting-simulator?style=social)](https://github.com/NoamLoewenstern/blackjack-counting-simulator)
[![forks - blackjack-counting-simulator](https://img.shields.io/github/forks/NoamLoewenstern/blackjack-counting-simulator?style=social)](https://github.com/NoamLoewenstern/blackjack-counting-simulator)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

[![LinkedIn][linkedin-badge]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/NoamLoewenstern/blackjack-counting-simulator">
    <img src="public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Blackjack Counting Visual Simulator</h3>

  <p align="center">
    A <strong>visual simulator</strong> of counting strategy playing blackjack
    <br />
    <a href="https://github.com/NoamLoewenstern/blackjack-counting-simulator"><strong>View Source Code »</strong></a>
    <br />
    <br />
    <a href="https://blackjack-counting-simulator.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/NoamLoewenstern/blackjack-counting-simulator/issues">Report Bug</a>
    ·
    <a href="https://github.com/NoamLoewenstern/blackjack-counting-simulator/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#demo">Demo</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

### Motivation - Learning New Tech!

I've been intrigued by Blackjack and statistical analyses that can provide a player with an advantageous edge.

While simulators exist on the web, I haven't encountered a visually engaging simulator that illustrates how a player would compete against a card-counting bot. This includes considering **Betting Variations** beyond the known **Perfect Blackjack Strategy**.

I'm always keen to learn new technologies and libraries to solve problems. Therefore, I started developing a website using the **[zustand](https://docs.pmnd.rs/zustand/)** state management library.

However, the simplicity soon gave way to complexity when dealing with the game flow and managing various state conditions, which became quite chaotic.

I was recently introduced to the **[xstate](https://stately.ai/docs)** library, and after initial reservations about its usage style, I've grown to appreciate it **immensely**.

It offers an intuitive approach to handling **deterministic finite states** and is extremely powerful.

However, it does have its shortcomings, primarily its documentation and the lack of clear "best practices". This includes guidance on where to store specific variables and how to handle dependency injection callbacks and variables, among other things.

**Blackjack's game flow** is an ideal case for testing out xstate. The game's finite options and intricate rules make it a complex yet suitable scenario. I honestly can't envision a simpler implementation method than xstate.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Typescript][Typescript]][Typescript-url]
- [![React][React.js]][React-url]
- [![Vite][Vite.js]][Vite-url]
- [![xstate][xstate]][xstate-url]
- [![Vercel][Vercel]][Vercel-url]
- [![TailwindCss][TailwindCss]][TailwindCss-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Demo

<!-- ROADMAP -->

[![hosted-website-badge]](https://blackjack-counting-simulator.vercel.app/)

![Website Example Gif][website-flow]
![adf][example-mainpage]
![adf][example-flow1]
![adf][example-flow2]

## Roadmap

- [ ] Improve UX
- [ ] Settings
  - [ ] Configure Bet Variations
  - [x] Change speed of game
  - [ ] Allow disable recommended action

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<div align="center">

</div>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origi
n feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Released under [MIT](/LICENSE) by [@NoamLoewenstern](https://github.com/NoamLoewenstern).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Noam Loewenstern - [Linkedin]() - alias-email: noam-loewenstern-github-alias.voaj5@aleeas.com

Project Link: [https://github.com/NoamLoewenstern/blackjack-counting-simulator](https://github.com/NoamLoewenstern/blackjack-counting-simulator)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[hosted-website-url]: https://blackjack-counting-simulator.vercel.app/
[hosted-website-badge]: https://img.shields.io/badge/Hosted%20Demo-8A2BE2
[contributors-url]: https://github.com/NoamLoewenstern/blackjack-counting-simulator/graphs/contributors
[license-url]: https://github.com/NoamLoewenstern/blackjack-counting-simulator/blob/master/LICENSE.txt
[linkedin-badge]: https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=fff&style=for-the-badge
[linkedin-url]: www.linkedin.com/in/noamlo
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Typescript]: https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[xstate]: https://img.shields.io/badge/XState-2C3E50.svg?style=for-the-badge&logo=XState&logoColor=white
[xstate-url]: https://stately.ai/docs
[Vercel]: https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=Vercel&logoColor=white
[Vercel-url]: https://vercel.com/
[TailwindCss]: https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=for-the-badge&logo=Tailwind-CSS&logoColor=white
[TailwindCss-url]: https://tailwindcss.com/

<!-- image/videos -->

[website-flow]: examples/example-flow.gif
[example-mainpage]: examples/main-page.png
[example-flow1]: examples/example-flow1.png
[example-flow2]: examples/example-flow2.png
