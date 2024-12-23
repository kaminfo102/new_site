import {
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'طراحی مدرن',
    description: 'استفاده از جدیدترین تکنولوژی‌ها و فریم‌ورک‌ها برای ارائه بهترین تجربه کاربری',
    icon: <AdjustmentsHorizontalIcon className="h-6 w-6" />,
  },
  {
    name: 'پشتیبانی ۲۴/۷',
    description: 'تیم پشتیبانی ما در تمام ساعات شبانه‌روز آماده پاسخگویی به سؤالات شما است',
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
  },
  {
    name: 'امنیت بالا',
    description: 'استفاده از پیشرفته‌ترین روش‌های رمزنگاری و امنیتی برای حفاظت از داده‌های شما',
     icon: <ShieldCheckIcon className="h-6 w-6" />,
  },
  {
    name: 'بهینه‌سازی سئو',
    description: 'طراحی و پیاده‌سازی اصولی برای بهبود رتبه سایت شما در موتورهای جستجو',
    icon: <ChartBarIcon className="h-6 w-6" />,
  },
  {
    name: 'رابط کاربری واکنش‌گرا',
    description: 'طراحی سازگار با تمامی دستگاه‌ها از موبایل تا دسکتاپ',
    icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
  },
  {
    name: 'عملکرد سریع',
    description: 'بهینه‌سازی کامل برای سرعت بارگذاری بالا و تجربه کاربری روان',
    icon: <RocketLaunchIcon className="h-6 w-6" />,
  },
];

export default function Features() {
  return (
    <div dir="rtl" className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">
            ویژگی‌های ما
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            راهکارهای هوشمند برای کسب و کار شما
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            ما با استفاده از جدیدترین تکنولوژی‌ها، بهترین راهکارها را برای رشد کسب و کار شما ارائه می‌دهیم.
          </p>
        </div>

        <div className="mt-10">
          <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt className="flex items-center">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                   {feature.icon}
                  </div>
                  <div className="mr-16">
                    <span className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </span>
                  </div>
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300 mr-16">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
