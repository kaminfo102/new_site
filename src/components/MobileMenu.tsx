import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function MobileMenu() {
  return (
    <Menu as="div" className="relative inline-block text-right">
      <Menu.Button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
        <Bars3Icon className="h-5 w-5" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                >
                  صفحه اصلی
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/about"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                >
                  درباره ما
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/contact"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                >
                  تماس با ما
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}