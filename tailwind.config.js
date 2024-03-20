/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-expect-error
const plugin = require('tailwindcss/plugin')
const {
  textUtilities,
  colorUtilities,
  borderRadiusTokens,
  elevationUtilities,
} = require('@oxide/design-system/styles/dist/tailwind-tokens')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  corePlugins: {
    fontFamily: false,
    fontSize: false,
  },
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'sm+': { min: '640px' },
        'md+': { min: '768px' },
        'lg+': { min: '1024px' },
        'xl+': { min: '1280px' },
        'sm-': { max: '639px' },
        'md-': { max: '767px' },
        'lg-': { max: '1023px' },
        'xl-': { max: '1279px' },
      },
      zIndex: {
        toast: '50',
        modalDropdown: '50',
        modal: '40',
        sideModalDropdown: '40',
        sideModal: '30',
        topBar: '20',
        popover: '10',
        contentDropdown: '10',
        content: '0',
      },
    },
    borderRadius: {
      none: 0,
      ...borderRadiusTokens,
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
    },
  },
  plugins: [
    plugin(({ addVariant, addUtilities, variants }) => {
      // imitation of the twin.macro svg: variant. svg:text-green-500 puts green
      // on an SVG that's an immediate child of the element
      addVariant('svg', '& > svg')
      addVariant('children', '& > *')
      addVariant('between', '& > * + *')
      addVariant('selected', '.is-selected &')
      addVariant('disabled', '&.visually-disabled, &:disabled')
      addUtilities(
        Array.from({ length: 12 }, (_, i) => i)
          .map((i) => ({
            [`.grid-col-${i}`]: {
              'grid-column': `${i}`,
            },
          }))
          .reduce((p, c) => ({ ...p, ...c }), {}),
        variants
      )
      addUtilities(textUtilities)
      addUtilities(colorUtilities)
      addUtilities(elevationUtilities)
    }),
  ],
}
