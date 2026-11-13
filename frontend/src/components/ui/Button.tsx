import ArrowUpRightIcon from '@iconify-react/akar-icons/arrow-up-right';

interface ButtonProps {
    label: string,
}

export default function Button({label}: ButtonProps) {
    return (
        <section className="bg-[#212223] w-[250px] h-[48px] rounded-full flex items-center justify-center gap-1 px-8 py-2">
            <p className="text-white text-[16px] font-medium">{label}</p>
            <ArrowUpRightIcon height="1em" style={{ color: '#fff' }}/>
        </section>
    );
}