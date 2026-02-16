"use client"

import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    customClass?: string;
    children?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div
        ref={ref}
        {...rest}
        className={`absolute top-1/2 left-1/2 rounded-xl border border-white bg-black [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
));
Card.displayName = 'Card';

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: any, skew: number) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

interface CardSwapProps {
    width?: number;
    height?: number;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (index: number) => void;
    skewAmount?: number;
    easing?: 'elastic' | 'power';
    children: React.ReactNode;
}

const CardSwap: React.FC<CardSwapProps> = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}) => {
    const config =
        easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                promoteOverlap: 0.9,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                promoteOverlap: 0.45,
                returnDelay: 0.2
            };

    const childArr = useMemo(() => Children.toArray(children), [children]);
    const refs = useMemo(
        () => childArr.map(() => React.createRef<HTMLDivElement>()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [childArr.length]
    );

    const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number | undefined>(undefined);
    const container = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const total = refs.length;
        refs.forEach((r, i) => {
            if (r.current) {
                placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount)
            }
        });

        const swap = () => {
            if (order.current.length < 2) return;

            const [front, ...rest] = order.current;
            const elFront = refs[front]?.current;
            if (!elFront) return;

            const tl = gsap.timeline();
            tlRef.current = tl;

            tl.to(elFront, {
                y: '+=500',
                duration: config.durDrop,
                ease: config.ease
            });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
            rest.forEach((idx, i) => {
                const el = refs[idx].current;
                if (!el) return;
                const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.durMove,
                        ease: config.ease
                    },
                    `promote+=${i * 0.15}`
                );
            });

            const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
            tl.call(
                () => {
                    gsap.set(elFront, { zIndex: backSlot.zIndex });
                },
                undefined,
                'return'
            );
            tl.to(
                elFront,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    z: backSlot.z,
                    duration: config.durReturn,
                    ease: config.ease
                },
                'return'
            );

            tl.call(() => {
                order.current = [...rest, front];
            });
        };

        intervalRef.current = globalThis.setInterval(swap, delay) as unknown as number;

        if (pauseOnHover) {
            const node = container.current;
            if (!node) return;
            const pause = () => {
                tlRef.current?.pause();
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
            const resume = () => {
                tlRef.current?.play();
                intervalRef.current = globalThis.setInterval(swap, delay) as unknown as number;
            };
            node.addEventListener('mouseenter', pause);
            node.addEventListener('mouseleave', resume);
            return () => {
                node.removeEventListener('mouseenter', pause);
                node.removeEventListener('mouseleave', resume);
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

    const rendered = childArr.map((child, i) => {
        if (isValidElement(child)) {
            const element = child as React.ReactElement<any>;
            return cloneElement(element, {
                key: i,
                ref: refs[i],
                style: { width, height, ...(element.props.style || {}) },
                onClick: (e: React.MouseEvent) => {
                    element.props.onClick?.(e);
                    onCardClick?.(i);
                }
            });
        }
        return child;
    });

    return (
        <div
            ref={container}
            className="absolute bottom-1/2 right-1/2 transform translate-x-[-1/2] translate-y-[-1/2] perspective-[1200px] overflow-visible"
            style={{ width, height }}
        >
            {rendered}
        </div>
    );
};

export default CardSwap;
