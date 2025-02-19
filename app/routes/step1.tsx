import { TransitionLink } from '~/transition-link';

export const clientLoader = () => {
  // await new Promise((resolve) => setTimeout(resolve, 600));
  return {};
};

export default function Step1() {
  return (
    <main>
      <h1 className="text-4xl">Step 1</h1>
      <ul className="p-2 gap-2 flex flex-col">
        {Array.from({ length: 30 }).map((_, i) => {
          if (i === 6) {
            return (
              <li key={i} className="h-64 bg-gray-400 odd:bg-gray-300 rounded block">
                <TransitionLink
                  to={'-1'}
                  viewTransitionName="page-default-backward"
                  viewTransition
                  className="size-full flex justify-center items-center text-7xl"
                >
                  <span className="text-lg text-gray-500">zurück zu </span>
                  Home
                  <span className="text-lg text-gray-500">{i + 1}</span>
                </TransitionLink>
              </li>
            );
          }

          return (
            <li key={i} className="h-64 bg-gray-400 odd:bg-gray-300 rounded block">
              <TransitionLink
                to="/step2"
                viewTransitionName="page-default-forward"
                viewTransition
                className="size-full flex justify-center items-center text-7xl"
              >
                2
                <span className="text-lg text-gray-500">{i + 1}</span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
