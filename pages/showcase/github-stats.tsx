import { Error } from './../../components/showcase/github-stats/error'
import { LoadNewUser } from './../../components/showcase/github-stats/load-new-user'
import type { GetStaticProps, NextPage } from 'next'
import type { ApolloQueryResult } from '@apollo/client'

import { gitHubClient } from '../../lib/apollo-client'
import { GitHubUserQuery, useGitHubUserLazyQuery } from '../../generated/github'
import { UserCard } from '../../components/showcase/github-stats/user-card'
import { gitHubUserQuery } from '../../graphql/github'

import Layout from '../../components/Layout'
import PageTitle from '../../components/PageTitle'
import { FormEventHandler, useEffect, useState } from 'react'
import Head from 'next/head'

const userLoadingState: GitHubUserQuery['user'] = {
  login: 'Loading...',
  name: '',
  bio: '',
  avatarUrl: '/img/avatar.png',
  url: '',
  contributionsCollection: {
    totalCommitContributions: 0,
    totalIssueContributions: 0,
    totalPullRequestContributions: 0,
    contributionCalendar: {
      totalContributions: 0,
      weeks: [],
    },
    contributionYears: [],
  },
  followers: { totalCount: 0 },
  following: { totalCount: 0 },
  repositories: {
    totalCount: 0,
    nodes: [
      {
        name: 'Loading...',
        description: '',
        url: '#',
        stargazers: { totalCount: 0 },
        watchers: { totalCount: 0 },
        forks: { totalCount: 0 },
      },
    ],
  },
}

type Props = {
  response: ApolloQueryResult<GitHubUserQuery>
}
const GitHubStatsPage: NextPage<Props> = ({ response }) => {
  // Hook to get the user's GitHub profile data when requested through getUser
  const [getUser, { error, data, loading, previousData }] =
    useGitHubUserLazyQuery({
      variables: { username: 'mward-sudo' },
      client: gitHubClient,
    })

  // userData state is set either
  const [userData, setUserData] = useState<GitHubUserQuery['user']>(
    response.data.user
  )

  // setUserData if data changes
  useEffect(() => {
    if (data) {
      setUserData(data.user)
    }
  }, [data])

  const reloadData: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const elem = document.getElementById('username') as HTMLInputElement
    const username = elem?.value
    getUser({ variables: { username } })
  }

  return (
    <Layout>
      <Head>
        <title>GitHub Profile</title>
      </Head>
      <div className="flex flex-col justify-between lg:flex-row">
        <div className="text-center lg:text-left">
          <PageTitle>GitHub Profile</PageTitle>
        </div>
        <LoadNewUser login={userData?.login} reloadData={reloadData} />
      </div>
      {error && <Error error={error.message} />}
      {userData && !error && <UserCard user={userData} />}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await gitHubClient.query<GitHubUserQuery>({
    query: gitHubUserQuery,
    variables: { username: 'mward-sudo' },
  })

  return {
    props: {
      response,
    },
    revalidate: 60,
  }
}

export default GitHubStatsPage
