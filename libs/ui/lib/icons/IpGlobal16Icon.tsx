import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const IpGlobal16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/ip-global">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.74998 7.99997C5.74998 7.57577 5.75808 7.15858 5.77372 6.74997H10.2262C10.2419 7.15858 10.25 7.57577 10.25 7.99997C10.25 8.59874 10.2338 9.18357 10.2031 9.74996H5.79683C5.76611 9.18357 5.74998 8.59874 5.74998 7.99997ZM4.24998 7.99997C4.24998 7.57745 4.25768 7.16029 4.27268 6.74997H0.0970862C0.0331779 7.15727 0 7.57475 0 7.99999C0 8.6011 0.0662978 9.18673 0.19198 9.74996H4.29474C4.26526 9.18005 4.24998 8.59533 4.24998 7.99997ZM0.687707 11.25C1.56126 13.2125 3.20169 14.7583 5.22838 15.5068C5.20525 15.4342 5.18256 15.3608 5.16029 15.2865C4.82 14.1522 4.56121 12.7752 4.40811 11.25H0.687707ZM9.01443 15.9363C8.68221 15.9783 8.34363 16 7.99999 16C7.65634 16 7.31775 15.9783 6.98551 15.9363C6.85081 15.6263 6.72003 15.2655 6.59702 14.8555C6.29867 13.861 6.06243 12.6324 5.91605 11.25H10.0839C9.93751 12.6324 9.70127 13.861 9.40292 14.8555C9.27991 15.2655 9.14913 15.6263 9.01443 15.9363ZM10.7716 15.5069C12.7983 14.7583 14.4387 13.2125 15.3123 11.25H11.5918C11.4387 12.7752 11.1799 14.1522 10.8396 15.2865C10.8174 15.3608 10.7947 15.4342 10.7716 15.5069ZM15.808 9.74996C15.9337 9.18673 16 8.6011 16 7.99999C16 7.57475 15.9668 7.15727 15.9029 6.74997H11.7273C11.7423 7.16029 11.75 7.57745 11.75 7.99997C11.75 8.59533 11.7347 9.18005 11.7052 9.74996H15.808ZM15.5148 5.24998C14.7099 3.05113 12.9675 1.30415 10.7716 0.49313C10.7947 0.565754 10.8174 0.639198 10.8396 0.713418C11.2167 1.97042 11.4938 3.5254 11.6378 5.24998H15.5148ZM6.98549 0.0637158C7.31773 0.0216692 7.65633 0 7.99999 0C8.34363 0 8.68222 0.0216673 9.01445 0.0637102C9.14914 0.373718 9.27991 0.734435 9.40292 1.14444C9.73677 2.2573 9.99287 3.66327 10.1323 5.24998H5.86766C6.00707 3.66327 6.26317 2.2573 6.59702 1.14444C6.72002 0.734438 6.85079 0.373722 6.98549 0.0637158ZM5.22836 0.493148C3.0325 1.30417 1.29008 3.05115 0.485198 5.24998H4.36217C4.50618 3.5254 4.78319 1.97042 5.16029 0.713418C5.18255 0.639204 5.20524 0.565766 5.22836 0.493148Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default IpGlobal16Icon
