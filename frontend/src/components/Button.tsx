import React from 'react';

{/* eslint-disable react/jsx-props-no-spreading */}
import { forwardRef } from "react";
import { type VariantProps } from "tailwind-variants";
import {secButton, clickedButton, warnButton, baseButton} from "./ButtonStyles";

// define all the button attributes
type BaseButtonAttributes = React.ComponentPropsWithoutRef<"button">;

// define the ref type
type Ref = HTMLButtonElement;

// extend the base button attributes
interface ButtonProps extends BaseButtonAttributes {
    disabled?: boolean;
    buttonStyle?: VariantProps<typeof clickedButton | typeof secButton | typeof baseButton | typeof warnButton>;
    className?: string;
    buttonVariant?: "clicked" | "sec" | "warn";
    responsive?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
}

const Button = forwardRef<Ref, ButtonProps>((props, ref) => {
    // destructure necessary props
    const { 
        type, 
        children, 
        onClick,
        buttonStyle, 
        className,
        buttonVariant, 
        disabled = false,
        responsive = false,
        size,
        fullWidth = false,
        ...rest 
    } = props;

    const renderButtonVariant = () => {
        let styles = {};
        
        if (responsive) {
            styles = { responsive: true };
        }
        
        if (size) {
            styles = { ...styles, size };
        }
        
        if (fullWidth) {
            styles = { ...styles, behavior: 'block' };
        }

        const finalStyles = { ...styles, ...buttonStyle, className };

        if (buttonVariant === "clicked") {
            return clickedButton(finalStyles);
        }
        
        if (buttonVariant === "sec") {
            return secButton(finalStyles);
        }
        
        if (buttonVariant === "warn") {
            return warnButton(finalStyles);
        }
        
        return baseButton(finalStyles);
    }

    return (
        <button
            className={`${renderButtonVariant()} ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            {...rest}
            type={type === "submit" ? "submit" : "button"}
            onClick={onClick}
            disabled={disabled}
            ref={ref}
        >
            {children}
        </button>
    );
});

export default Button;