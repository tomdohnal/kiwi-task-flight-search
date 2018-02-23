import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';

import SearchForm from './SearchForm';
import Header from './Header';
import FlightList from './FlightList';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

class App extends Component {
  state = {
    flights: [],
  };

  formatFlightDate(date) {
    date = new Date(date);

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  }

  searchFlights = async (fromLocations, toLocations, date) => {
    try {
     /* const result = await this.props.client.query({
        query: allFlights,
        variables: { search: {
            from: [{ location: 'London' }],
            to: [{ location: 'Paris' }],
            date: {
              exact: '2018-02-28',
            },
          },
        },
      });*/
      this.setState({
        flights: [{"arrival":{"airport":"Charles de Gaulle Airport","city":"Paris","time":"2/28/2018 10:00","localTime":"2018-02-28T10:00:00.000Z"},"departure":{"airport":"Gatwick","city":"London","time":"2018-02-28T07:40:00.000Z","localTime":"2018-02-28T07:40:00.000Z"},"duration":80,"price":{"amount":46,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=46&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDCMufS0t%2FtY27AH4%2Fscekv1aBWnigXTmbIGC4%2BVUhiaMA0ojo5a4mpbPIhZvFKYirCkuEPL78okJR0jZuoAyA%2B89pUIbU8MfbN14U%2FISlYrQb0W7dWAh8Xv%2Bpuc3BurlFr9iAA%2BvnI8rReN6GQhhU0%2FY1GYu%2BRXXlXRbaM9lpyM3cGJumxgbmSzJTUYvuacNKEOs1LAE0%2FkObTEbrxLCwkqsE8RAJyYgV7zqgJkNZZ0jUQRCIpFuAClKKzP6Z2tiuVGi67n9DllFVeQecI0UWZyf%2BTZBccSy8kCOTgt1p%2FWFiLRrH8Yi%2B3WmHGdanRtSFvCLwp9eA3zVFX20YCB%2BgRmy5ZmkshzH5OqSnkUvmctGbJQa76Ces%2FxCm0vYZ%2FFxkohn6%2F9aBIPyREW6Fqdq1F5IODRZrf9Ll3mSoK0bWgTcy54lQkghPKJjFlWzk8YSC%2Fc%2FxASxvkejk4HD%2F7VxXMxZk36H5TfTJDypZd9Hv43tvY24fdUvTr8bj2hLYq5TDrvyz93bD%2FzU4EZgCnxQMNRtybi2ck8fVhMiCddOZeeM%3D"},{"arrival":{"airport":"Charles de Gaulle Airport","city":"Paris","time":"2/28/2018 10:30","localTime":"2018-02-28T10:30:00.000Z"},"departure":{"airport":"Gatwick","city":"London","time":"2018-02-28T08:10:00.000Z","localTime":"2018-02-28T08:10:00.000Z"},"duration":80,"price":{"amount":68,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=68&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDrq72cX9ZfJ6bseC3dyNU6Owbmd5tfCXlZAMZUCq8hnFozKoGCWoilkFljL2C33uqdvEyEspT6cxtCgIcQAW%2Ft503Ge231b5PvIv1If177i2ukEslqA%2BxUedpo24%2BUVObu0Ytfb5fX%2B2KCBacZEhMIobOOtOQ2T1JA9755crDZ853LdaSd%2BEQLnMjcfhRy1c0pn9k4r3A%2FdLEfRuV%2FVSsXJsLrrfFnL9eUI4LmnZ9Fs8ZUu0POgWM3yWXYs38mzdq4jRHrSzgGs2w9%2BLV%2Fo28NDMZ%2FCF7hBargsdFFvx0cjoy%2BFVwYC9iIw08SZFBTzTj7KDV4DOkdOhhOHUjc4%2BFpPp3EOBy3pAYSociC9ezlxlvYIW9CTWMb20b2YM1Jgkt1r0ReG%2BZJPL5KyhQyM1dzDMm53dhsjVPaLpyb1mPB1L7SEWOKyz0Xe6CmI%2B%2F9xxOEZJT%2BUWUMckoDTkzxYt6M4b0iStVOdYXmz89CKCRVNeXPjvsQUZjLcdDjxuGyVMjU9cCMbK5ifdelueKHPL7wNRSFBwdxM0CGaJic6gBWitUoiKbmsPida1cB2eWkI60"},{"arrival":{"airport":"Charles de Gaulle Airport","city":"Paris","time":"2/28/2018 19:00","localTime":"2018-02-28T19:00:00.000Z"},"departure":{"airport":"Gatwick","city":"London","time":"2018-02-28T16:45:00.000Z","localTime":"2018-02-28T16:45:00.000Z"},"duration":75,"price":{"amount":69,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=69&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDDxQNjuuRcb6MbLqsxBvGQbAmQDeOk%2FajDP7dixumXd5vy53jv5LOicQi6gwAxWBaEHBj06y5u278xa8hoPKWty8xLbI8RG6Brkx%2FTugeeUG9OkSHuvExj6NojMwKvXHExJvvBdaPdpoOm5%2BxN%2FzuwdYY0Wie3IRERI02nsENMajp3RxWGDaqA50gO%2FbbzCb%2FJaAHkY34OM9kFqnkyZPZSQ%2FNmeirt73WgCGE96n107PfAS3qk3GYWajHEoIoOXBUFmUd9cuwvwypCxkQT9qjFDkaYj7o%2FC6TUmAFRtXrSuRj5sG7Lsv2DeDKiW5lUB4bzkVzYZVkGFX%2B1CtcbkHuBGq7QpCdl4w1W2Et9%2BAwJj6N9q%2B2Dn8M1xMKki4kFT5tlaBd3tDKFLMVCcE4BqXI1TViYC9dJRHoQykg4qvFBw3jChS6WbfZAzw5pqfet7t0PFdihVITPV8pEko1j6344voyiuTZ5Tg7%2B%2FLYUA7AAbITe%2FpflxFesz%2FCxKl%2BF%2BJKrehSInXw8rzectRVXwylDSJmw4BxXBR%2BksqWOEUsTHI%3D"},{"arrival":{"airport":"Charles de Gaulle Airport","city":"Paris","time":"2/28/2018 17:30","localTime":"2018-02-28T17:30:00.000Z"},"departure":{"airport":"Luton","city":"London","time":"2018-02-28T15:10:00.000Z","localTime":"2018-02-28T15:10:00.000Z"},"duration":80,"price":{"amount":70,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=70&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDIWQOU2pXLyuw%2B%2FOuMYomUgjBNLhU4eDQZcegR2jHpIGeCgAe99UM7ER4IQdE2lO8BrY8SSXyJyEc27sZIgWo4zHUdLQvbjfYRNT5FKWtNwYKDIAWw8zShYEfrt0gKTi8boxcSvIGdnGONMQlxZimQAOIidyqywMrFq%2FDPPJzdymOHD4RDQmAlhW%2BcT81azoQnOBedi81k55GcdeRE354ICS5YSXVRt38NqIiLHeqk02jzFEUchCU28e7htaI2HAkhmysPl%2F8lqhA9gOiePiOSnO%2BhYv7c5EuEn2JzYmTcBVMOqxjtcdjJSwFiD1b0pgFDyRJ6WuCMqR6woGi99lvgeSpZyYbd1odWOhGmBFHrTK7PD3fJ6K8g%2FYwPodoONOwYDwR9LrzeDhwe7XS9ol3kwAorsuQ4dhi4VIm4rp2vD%2FFcbV%2BnNToduf0sV3Yfb6meSK1oxaE%2Fsw4lDDop6TP5acydTmroaxV7pk35XUPIPC9W7FH9VUmbLPEFbz37%2FqQ48P6Q2NJ3aa5EITctNsXt6KoBFlad43wL5kjJdsievY%3D"},{"arrival":{"airport":"Charles de Gaulle Airport","city":"Paris","time":"2/28/2018 9:30","localTime":"2018-02-28T09:30:00.000Z"},"departure":{"airport":"Luton","city":"London","time":"2018-02-28T07:05:00.000Z","localTime":"2018-02-28T07:05:00.000Z"},"duration":85,"price":{"amount":72,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=72&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDYYLD%2BDjpa30dHA50NY8NQ4AvTd2%2BKSOIQ2nz1%2BvB2kY6BOZVIUukOn6zWW7x%2BDJwBxEfhxR1PBsAvcSsBHpCuIduIAIMnYCEGhr2qHHnJIk2PRzVeUYWgPD1Ap2URwu%2B5yoG87%2BXzrPwFzlieMRoTwCVnBRWUXIUgj63MU3SahA0l0SI74MIIewwuku3mfsD5ty0I2CVydwtuEyDBwoO5c%2BzcOkgkTBCPj%2BUfS1hxlAXAc8%2Br36yCnDtfjzNXOiB4oP2dFvtL%2ByLbFkloZzLrj7FCZ9Xbf8otrFDLYzNbf7hyq6WKrN3HyvU3MH%2FRTayI2Hj5a6fdZHj1Ffu9s9ov5UCKpVCZM1Q8Q6JK0LAiLLBsgNIZkHOGoW7CuohQkV5RYElnfcO2IeIdgNyNTUybm7f27oXg8%2BhYehvQuTARhvL0LY8AEHRzbUPsGgFRJYlWJblBHTTMeD9cX5VqC2PAns730RY1z4nMmKbcpKu3u9aVcpDxqAYBRB8rxA39c0AKnSEWvqg1NyGIOZ%2BDkAwlsrGfuBO2Pmeew24vxsUMeirdtV9Y9bCJ7%2B6kgQ7lWUu"},{"arrival":{"airport":"Beauvais–Tillé","city":"Paris","time":"3/1/2018 9:05","localTime":"2018-03-01T09:05:00.000Z"},"departure":{"airport":"Gatwick","city":"London","time":"2018-02-28T21:30:00.000Z","localTime":"2018-02-28T21:30:00.000Z"},"duration":635,"price":{"amount":78,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=78&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBD7mOnHnrq9r6nEGbTi6IFwX4TyNoa%2B7J3OBC5iOxFAQLzhQBYCTGbbpXYqKUQ%2F8KibuNIpDJ02eG7Sgq1nA%2B1GlINVFWaFaE1R0E3sw%2F9BOoZ%2FKyYPMPtUBDrJHM3eKz6rOc%2B7k1W%2FdW8Gfeo4TiW%2Bu6rHwU%2Bqf94yesnAtksGcCRrMa0qBnQrQOMTq2TzRpb5w4pHfJRO0VuWig11DxoOgvdeOK9w%2FT0fsOkux0T%2B%2FLTS5EeCRuSoSksJ1rip7JUQwBHZTrefpz4zdzydWzFwhBJV%2BhrN7WeqzTivypTc9hCkBNanm9MG4uyWm8r7xKM8eOf9%2Fi2DWqZxxK1TurroBeCc0SIwAp7cNKetAj0D%2BAMIFYsPCvHJvdQheYyDv3bBoiEcloP315XtL2UL6TKz%2FaPZqEX7uRnOGq7HwYhFtsBNNCb6j41VaFRkUZgq4dzlkpApzkU2kgDhHEs%2B2ylnPzSLkwvRzg0oVPh%2FP2%2FQJkIjasE8SFryb0yVPFd98hyhWgIiTfUWutmfs9bMZZwljYv3xfcSlFs7RVXczpVD0%2Bo9ck9%2BPtpMCrU6sTzwi11jey0M7EH%2FWYMsIsANGhnjQ%3D%3D"},{"arrival":{"airport":"Charles de Gaulle Airport","city":"Paris","time":"2/28/2018 23:30","localTime":"2018-02-28T23:30:00.000Z"},"departure":{"airport":"Gatwick","city":"London","time":"2018-02-28T21:25:00.000Z","localTime":"2018-02-28T21:25:00.000Z"},"duration":65,"price":{"amount":81,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=81&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDEvubLubEMnol%2F9q%2Bc7fC9dsiSqqNxgx00z8SEd5yBlag7qnHAfOHEnI6yMg7F7ELUkBjoHt0MB6xOTZGDvfiA4VwIXUxdihceuYrz7bv8I12yFx0XPa0%2FJFKesJdPoPnYqn9ZonBOR4CTl0cbbwfj7J0i3CMKC109ygyXPis4DRHyJ%2BnHC2uLdsKw2N2gvtCdg8HGY7kwdhqcdMe3j8ZfYYKoFoiXrL5TAWlsFmHdbUVrtmTSecRIv0sQpNxUx1XqDQXQlWodI5lIEHa1BzkKf%2FqnJu9%2FrlSyT02ytlSM%2BqL4UqkPqIRcuY%2FO57Cnjo7dJzph8VxWlsKuQqyv5VVygsUqBh%2B5oQ0NAbnrmh66itvB6L9mSt3dki52KzWqaZFAnhxvFVp0n2aq%2FZgruckXAT7J6UUV5u3l5fMQUnhXbXp9u8f6rp%2FTEIssFp%2FXIbkrWOnlhg0%2BB7Z5iyqS%2B2bXOMb364FXOH8GycuqElzJraL%2BaX9gYi0%2BUeN13IA47X8rDcjkDO7MaeDhwgRG9q%2BPDNf340DpkStQg0pgcSRynykjVSq6Zl9plxZYtc59KUg"},{"arrival":{"airport":"Beauvais–Tillé","city":"Paris","time":"3/1/2018 9:05","localTime":"2018-03-01T09:05:00.000Z"},"departure":{"airport":"London Stansted","city":"London","time":"2018-02-28T22:05:00.000Z","localTime":"2018-02-28T22:05:00.000Z"},"duration":600,"price":{"amount":82,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=82&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDi8kPEXTGmzeMoDnp%2FhammANufb31x%2F46qD1qALqT3dBEnj81Xv3kFgQVKwDprNs7werwOnwwN5kljFdTZQK6shB582XVddqVsIlu87szFVdhBMunO77hrZ%2BCZi11RVtCVM4GoYeuq%2BW7kwyaZCXrLEWv%2FJateV9EUjL%2Bm5ldFg3JMZuW4oDDU%2BqyBm4qT9QPIJAe%2FP0j7%2BEJtWGf0AxqGMQ5bbvefd6OKOWI%2FwiiDWo%2BLvp9FgZWRmsQwNlJ2RDaDcKKjQG5wOmEvpWzpx2P%2BpwYBb0O23FZXlTAkbnckEWWT1te28oOPPO%2BdVtgTV9WCNMEC0vnNWnOVD4mxgdMFzZ2GnkYroEl1l1cM6PZVf%2B1DK%2BBSw0OrmzULlCTBv8pZ41SeQ57Iq%2FiWnlvI%2FYSYOYNTNBsByUcGuCaCG7c63cZMBu5uQDwk0IDA2dj7M7K45A1y2L2JeIYnsTKuOEXByfoWEuTLv%2BuFSyp17E20p%2BE4kKzimunxTgcilrx8klRoajQpSLgbTHgLclcxqQTu0Jl1nGbA%2FO4WzAkEEUA4HRYrfYZhoTBQW%2FudskReFFsmg31Hxus6TKN1OYeTBnjOg%3D%3D"},{"arrival":{"airport":"Beauvais–Tillé","city":"Paris","time":"3/1/2018 9:05","localTime":"2018-03-01T09:05:00.000Z"},"departure":{"airport":"Luton","city":"London","time":"2018-02-28T20:05:00.000Z","localTime":"2018-02-28T20:05:00.000Z"},"duration":720,"price":{"amount":82,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=82&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDi8kPEXTGmzeMoDnp%2FhammANufb31x%2F46qD1qALqT3dBEnj81Xv3kFgQVKwDprNs7IPTVjaY5dcDnZtOruvcJA2NwWOM%2Bm9j5lqCXVkv0b5PAeZ4voNerISNCAUfc%2B%2Bc%2FARo5VLRqEM61D0OQ1NDPInRkelbnh%2B3b29AN0ybMRGtJ%2BscVS6cltS1wxr1A%2FMxQPYml8g%2B%2BzV8XWRz0bEu8ENvn96svfZeLyYj3BF9%2BDufGrvA6ChFgLsvSdH5jegyXsslJcaI7uhUqFCPmc11IDnP7qprTkl%2BYfcULAugy7JYVyU1Q7N43mCZ9a8aIpmZdAsX%2F09SsM1B9FimTmqqcYVSuXwTBJOWQzBK2y2kuJPuB6UT%2Bc%2F9kuMtS%2FUYoYnKsJ6o1WWvHNlB1X8lhLEN14Lxo6QgJVxogTOi8GOaE%2FvPo2Nb2laI6jqApijzp%2BdS8MNl9DzWFHCR86Iz7PsmNcGrSXAIcMQ5NIAfnB418yOrDLYTTKMGQEaB2%2FSE8qxr7ZlUKqfrpMuyFRO%2BsHTE%2F6IByr%2B4ODSsJc1N%2FucgIsb2qYLbThcMOXTE4swmmNHa0XczXTO2O5uzV%2BwXZzy1oZw%3D%3D"},{"arrival":{"airport":"Paris Orly","city":"Paris","time":"2/28/2018 22:15","localTime":"2018-02-28T22:15:00.000Z"},"departure":{"airport":"London Stansted","city":"London","time":"2018-02-28T07:15:00.000Z","localTime":"2018-02-28T07:15:00.000Z"},"duration":840,"price":{"amount":86,"currency":"EUR"},"bookingUrl":"https://www.kiwi.com/en/booking?passengers=1-0-0&price=86&token=DHMwfZ9w9ZvT1CVktnOdJjHNSOOh4rh%2B%2FKRZU8WZ87jTduLZft63ditE2oPeCc8Ctk1Na4AYg9yIsaNzcG0qK1okjtkKMmEIr8BwOZbhx89DHWb7mY8lFhM6H8uecPBDUM9mkmj2XOzPRYa1CU3%2FIiX33CheBD1bTXWnpaGPOLyEi75jqEkEOHo57dLY3OW73z54I4aXhcLyycKi8bLvaT5AIiUC%2BLCPNNFpbyqqLDx22W0eJuvB4LYKr23KLNnnVqrx%2BmqN4cmSc4t2O5LemsnYlKacD5gXmJJa1wXHOCJCXuEZuginsKtul3XUQRkF1YRsVj2KzmDDC71HHvV5rYS%2BjnfCfn0nUkOT7IrXwatuH%2B1AV3X0OD0eMeIV%2BhKANRyEA3OU%2F3TRBl59x8RTlaaiExh0ydeeDffQNq5Ztq0GwD0kMjYX1m6WCwnaMkLh28zdi48Yo7XWQUPEBHKaftZKy4W5NdmBnzV%2BPOaS%2Fy1oglHDuzOWxsKTZYt3VrprGE2Z%2BqLY7mCthH1j47Wp0fF1NtDQbxarJsCipbHvYYMjgFIqRx6myzdB4s1Af7Dne3oT3c%2F3jrQkcuHNsWS4N62BLO3ieP0ixiJKWoG3Sx2yewRIrTDWjCmejNnHWZ99AG2TNzWB%2FcykZhMg%2Fo0GFql2p8Ad9lioLgeRWCxTyQlpdOCtntsxJ3XhyRiQwhBmuzSYKN2KgIsDTTGrHwBasg%3D%3D"}]},
        );
      /*this.setState({
        flights: result.data.allFlights.edges.map(({ node }) => ({
          arrival: {
            airport: node.arrival.airport.name,
            city: node.arrival.airport.city.name,
            time: this.formatFlightDate(node.arrival.time),
            localTime: node.arrival.localTime,
          },
          departure: {
            airport: node.departure.airport.name,
            city: node.departure.airport.city.name,
            time: node.departure.time,
            localTime: node.departure.localTime,
          },
          duration: node.duration,
          price: {
            amount: node.price.amount,
            currency: node.price.currency,
          },
          id: node.id,
        })),
      });*/
    } catch (error) {
      console.error(error);
    }

  };

  render() {
    const { flights } = this.state;
    return (
      <Container className="mt-4">
        <Header />
        <SearchForm searchFlights={this.searchFlights} />
        {!!flights.length && <FlightList flights={flights} />}
        {/* display error on search fail*/}
      </Container>
    );
  }
}

export const allFlights = gql`
  query allFlights($search: FlightsSearchInput!) {
    allFlights(search: $search, first: 5) {
      edges {
        node {
          id,
          arrival {
            airport {
              name,
              city {
                name,
              },
            },
            localTime,
            time,
          },
          departure {
            airport {
              name,
              city {
                name,
              },
            },
            localTime,
            time,
          },
          duration,
          price {
            amount,
            currency,
          },
        }
      }
    }
  }
`;

export default withApollo(App);
