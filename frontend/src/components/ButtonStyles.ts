import {tv} from 'tailwind-variants'

export const baseButton = tv({
    base: 'mt-5 rounded-md transition-all duration-200 ' +
        'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
        'text-center relative align-middle inline-flex items-center justify-center',
    variants: {
        size: {
            lg: 'text-base py-3 px-6',
            xs: 'text-xs py-1 px-2',
            md: 'text-sm py-2 px-4',
            xl: 'text-lg py-4 px-8',
            xxl: 'text-xl py-5 px-10',
            square_xs: 'text-xs h-8 w-8 p-0',
            square_sm: 'text-sm h-10 w-10 p-0',
            square_md: 'text-base h-12 w-12 p-0',
            square_lg: 'text-lg h-14 w-14 p-0',
            square_xl: 'text-xl h-16 w-16 p-0',
        },
        vPadding: {
            xs: 'py-1',
            sm: 'py-2',
            md: 'py-3',
            lg: 'py-4',
        },
        vSpace: {
            xs: 'my-1',
            sm: 'my-2',
            md: 'my-4',
            lg: 'my-6',
        },
        HSpace: {
            xs: 'mx-1',
            sm: 'mx-2',
            md: 'mx-4',
            lg: 'mx-6',
        },
        align: {
            center: 'mx-auto',
            right: 'ml-auto',
            left: 'mr-auto',
            top: 'mb-auto',
            bottom: 'mt-auto',
        },
        behavior: {
            block: 'w-full',
        },
        responsive: {
            true: 'text-sm py-2 px-3 md:text-base md:py-3 md:px-4',
        }
    }
});

// Primary button (was "clicked")
export const clickedButton = tv({
    extend: baseButton,
    base: 'bg-gold text-black-800 border border-gold shadow-sm ' +
        'hover:bg-gold-light hover:border-gold-light hover:shadow-md focus:ring-gold active:bg-gold-dark'
});

// Secondary button
export const secButton = tv({
    extend: baseButton,
    base: 'bg-transparent border border-gold text-gold ' +
        'hover:bg-gold/10 focus:ring-gold'
});

// Warning button
export const warnButton = tv({
    extend: baseButton,
    base: 'bg-transparent border border-accent-red text-accent-red ' +
        'hover:bg-accent-red/10 hover:text-accent-red focus:ring-accent-red'
});