import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Here you would typically make an API call to your newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setStatus('success');
      setMessage('با تشکر از ثبت‌نام شما در خبرنامه!');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('متأسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <div className="bg-indigo-600 dark:bg-indigo-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="px-6 py-6 md:py-12 md:px-12 lg:py-16 lg:px-16 xl:flex xl:items-center">
          <div className="xl:w-0 xl:flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              عضویت در خبرنامه
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-indigo-200">
              برای دریافت آخرین اخبار و اطلاعیه‌ها در خبرنامه ما عضو شوید.
            </p>
          </div>
          <div className="mt-8 sm:w-full sm:max-w-md xl:mt-0 xl:mr-8">
            <form onSubmit={handleSubmit} className="sm:flex">
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full border-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white rounded-md"
                placeholder="ایمیل خود را وارد کنید"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className="mt-3 w-full flex items-center justify-center px-5 py-3 border border-transparent shadow text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white sm:mt-0 sm:mr-3 sm:w-auto sm:flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'در حال ثبت...' : 'ثبت‌نام'}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${status === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}